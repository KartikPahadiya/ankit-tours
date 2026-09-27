"""In-process end-to-end test of the new admin/content features.

Uses FastAPI's TestClient so no network ports are involved.
"""
import sys

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
failures = 0


def check(name, ok, detail=""):
    global failures
    if not ok:
        failures += 1
    print(("PASS " if ok else "FAIL ") + name + (f"  :: {detail}" if detail and not ok else ""))


# 1. Public packages (what the website shows)
res = client.get("/api/packages")
check("GET /api/packages -> 200", res.status_code == 200, f"got {res.status_code}")
packages = res.json()
check(
    "Ankit's 2 packages visible",
    len(packages) == 2
    and any("3-Day" in p["title"] for p in packages)
    and any("5-Day" in p["title"] for p in packages),
    f"got {[p['title'] for p in packages]}",
)
check(
    "package shape correct",
    packages
    and all(
        key in packages[0]
        for key in (
            "id",
            "title",
            "duration",
            "price",
            "includes",
            "icon",
            "color",
            "is_active",
        )
    ),
    f"keys: {sorted(packages[0].keys()) if packages else 'empty'}",
)

# 2. Admin login
res = client.post(
    "/api/auth/login",
    json={"email": "admin@travelnest.com", "password": "Admin@12345"},
)
check("admin login -> 200", res.status_code == 200, f"got {res.status_code}: {res.text[:200]}")
token = res.json().get("access_token")
check("access token returned", bool(token))
auth = {"Authorization": f"Bearer {token}"}

# 3. Admin packages list
res = client.get("/api/admin/packages", headers=auth)
check("GET /api/admin/packages -> 200", res.status_code == 200, f"got {res.status_code}")
check("admin sees both packages", len(res.json()) == 2, f"got {len(res.json())}")

# 4. Create a package
res = client.post(
    "/api/admin/packages",
    headers=auth,
    json={
        "title": "Test Safari Config",
        "duration": "1N / 2D",
        "price": 1234,
        "price_type": "perPerson",
        "includes": ["Test include"],
        "icon": "\U0001F9EA",
        "color": "blue",
    },
)
check("POST /api/admin/packages -> 201", res.status_code == 201, f"got {res.status_code}: {res.text[:300]}")
pkg = res.json()
pkg_id = pkg.get("id")

# 5. New package appears on the public site immediately
res = client.get("/api/packages")
check(
    "new package visible publicly",
    any(p["id"] == pkg_id for p in res.json()),
)

# 6. Update it
res = client.patch(
    f"/api/admin/packages/{pkg_id}",
    headers=auth,
    json={"price": 4321, "is_active": False},
)
check("PATCH package -> 200", res.status_code == 200, f"got {res.status_code}")
check("price updated", float(res.json()["price"]) == 4321)

# 7. Deactivated package hidden from public
res = client.get("/api/packages")
check(
    "deactivated package hidden from public",
    not any(p["id"] == pkg_id for p in res.json()),
)

# 8. Delete it
res = client.delete(f"/api/admin/packages/{pkg_id}", headers=auth)
check("DELETE package -> 200", res.status_code == 200, f"got {res.status_code}")

# 9. Admin bookings with customer details
res = client.get("/api/admin/bookings", headers=auth)
check("GET /api/admin/bookings -> 200", res.status_code == 200, f"got {res.status_code}")
bookings = res.json()
if bookings:
    check(
        "booking includes customer + property fields",
        all(
            key in bookings[0]
            for key in (
                "customer_name",
                "customer_email",
                "customer_phone",
                "room_name",
                "stay_name",
            )
        ),
        f"keys: {sorted(bookings[0].keys())}",
    )
    print(f"     ({len(bookings)} booking(s) with customer data)")
else:
    check("bookings endpoint responds (empty list OK)", res.status_code == 200)

# 10. Non-admins rejected
res = client.get("/api/admin/bookings")
check("admin endpoints reject no-token -> 401/403", res.status_code in (401, 403), f"got {res.status_code}")

# 11. Property images: local upload (no external service)
import base64

res = client.get("/api/admin/stays", headers=auth)
check("GET /api/admin/stays -> 200", res.status_code == 200, f"got {res.status_code}")
stays = res.json()
if stays:
    stay_id = stays[0]["id"]

    # 1x1 transparent PNG
    png_bytes = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    )

    res = client.post(
        f"/api/admin/stays/{stay_id}/images",
        headers=auth,
        files={"file": ("test.png", png_bytes, "image/png")},
    )
    check(
        "POST upload image -> 201",
        res.status_code == 201,
        f"got {res.status_code}: {res.text[:200]}",
    )

    if res.status_code == 201:
        img = res.json()

        check(
            "uploaded image stored under local /uploads",
            "/uploads/" in img["image_url"],
            f"url: {img['image_url']}",
        )

        res = client.get(f"/{img['public_id']}")
        check(
            "uploaded file served by backend -> 200",
            res.status_code == 200,
            f"got {res.status_code}",
        )

        res = client.get(
            f"/api/admin/stays/{stay_id}/images", headers=auth
        )
        check(
            "GET images lists the upload",
            res.status_code == 200
            and any(i["id"] == img["id"] for i in res.json()),
        )

        res = client.delete(
            f"/api/admin/stays/{stay_id}/images/{img['id']}",
            headers=auth,
        )
        check(
            "DELETE image -> 200",
            res.status_code == 200,
            f"got {res.status_code}",
        )

# 12. Website images unchanged: public stays still serve their images
res = client.get("/api/stays")
check("GET /api/stays -> 200", res.status_code == 200, f"got {res.status_code}")
public_stays = res.json()
check(
    "existing properties keep their images on the website",
    bool(public_stays) and any(s.get("primary_image") for s in public_stays),
    f"images: {[s.get('primary_image') for s in public_stays]}",
)

# 13. New property gets the standard default image automatically
import time

unique_slug = f"image-test-{int(time.time())}"
res = client.post(
    "/api/admin/stays",
    headers=auth,
    json={
        "name": "Default Image Test Property",
        "slug": unique_slug,
        "property_type": "Hotel",
        "city": "Test City",
        "state": "Test State",
        "country": "India",
    },
)
check(
    "POST /api/admin/stays -> 201",
    res.status_code == 201,
    f"got {res.status_code}: {res.text[:300]}",
)
if res.status_code == 201:
    new_stay = res.json()
    detail = client.get(f"/api/stays/{new_stay['slug']}")
    detail_ok = detail.status_code == 200
    images = detail.json().get("images", []) if detail_ok else []
    check(
        "new property created, photos added by admin",
        detail_ok and len(images) == 0,
        f"detail {detail.status_code}, images: {images}",
    )
    # cleanup: deactivate the test property
    client.delete(f"/api/admin/stays/{new_stay['id']}", headers=auth)

# 14. Safari options (separate from tour packages)
res = client.get("/api/safaris")
check("GET /api/safaris -> 200", res.status_code == 200, f"got {res.status_code}")
configs = res.json()
check(
    "4 safari options seeded (Gypsy/Canter x Morning/Afternoon)",
    len(configs) == 4,
    f"got {[(c['vehicle_type'], c['shift']) for c in configs]}",
)

res = client.post(
    "/api/admin/safaris",
    headers=auth,
    json={
        "vehicle_type": "Canter",
        "shift": "Morning",
        "price_per_person": 777,
        "seats_per_vehicle": 20,
    },
)
check(
    "POST safari option -> 201",
    res.status_code == 201,
    f"got {res.status_code}: {res.text[:200]}",
)
sid = res.json().get("id")

res = client.patch(
    f"/api/admin/safaris/{sid}",
    headers=auth,
    json={"price_per_person": 888, "is_active": False},
)
check("PATCH safari option -> 200", res.status_code == 200, f"got {res.status_code}")
check("safari price updated", float(res.json()["price_per_person"]) == 888)

res = client.get("/api/safaris")
check(
    "hidden safari not public",
    not any(c["id"] == sid for c in res.json()),
)

res = client.delete(f"/api/admin/safaris/{sid}", headers=auth)
check("DELETE safari option -> 200", res.status_code == 200, f"got {res.status_code}")

res = client.get("/api/admin/safaris")
check("admin safaris reject no-token -> 401/403", res.status_code in (401, 403), f"got {res.status_code}")

# 15. Custom package plan flow
res = client.post(
    "/api/custom-plans",
    headers=auth,
    json={
        "travel_days": 4,
        "safari_type": "Gypsy",
        "safari_date": "2026-10-10",
        "safari_shift": "Morning",
        "hotel_category": "Premium",
        "pickup": True,
        "village": True,
        "photography": False,
        "food": True,
    },
)
check(
    "POST custom plan -> 201",
    res.status_code == 201,
    f"got {res.status_code}: {res.text[:200]}",
)
plan_id = res.json().get("id")

res = client.get("/api/custom-plans/my", headers=auth)
check(
    "user sees own custom plan (requested)",
    res.status_code == 200
    and any(
        p["id"] == plan_id and p["status"] == "requested"
        for p in res.json()
    ),
    f"got {res.status_code}",
)

res = client.get("/api/admin/custom-plans", headers=auth)
check(
    "admin sees custom plan with customer info",
    res.status_code == 200
    and any(
        p["id"] == plan_id and p.get("user_email")
        for p in res.json()
    ),
    f"got {res.status_code}",
)

res = client.patch(
    f"/api/admin/custom-plans/{plan_id}",
    headers=auth,
    json={"status": "accepted"},
)
check(
    "admin accepts custom plan -> 200",
    res.status_code == 200 and res.json()["status"] == "accepted",
    f"got {res.status_code}: {res.text[:200]}",
)

res = client.get("/api/custom-plans/my", headers=auth)
check(
    "user sees accepted status",
    any(
        p["id"] == plan_id and p["status"] == "accepted"
        for p in res.json()
    ),
)

res = client.post("/api/custom-plans", json={})
check("custom plan requires auth -> 401/403/422", res.status_code in (401, 403, 422), f"got {res.status_code}")

# 16. My bookings include payment status
res = client.get("/api/bookings/my", headers=auth)
check(
    "GET /api/bookings/my includes payment_status field",
    res.status_code == 200
    and all("payment_status" in b for b in res.json()),
    f"got {res.status_code}",
)

print()
print("ALL CHECKS PASSED" if failures == 0 else f"{failures} CHECK(S) FAILED")
sys.exit(1 if failures else 0)
