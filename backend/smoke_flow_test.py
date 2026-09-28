"""Smoke test for the unified booking-request flow.

Run from backend/ with venv python:
    ./venv/Scripts/python.exe smoke_flow_test.py
"""
import sys

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

ADMIN = {"email": "admin@ankittravels.com", "password": "Admin@12345"}
USER = {"email": "reqtest@example.com", "password": "Test@12345"}


def login(payload):
    r = client.post("/api/auth/login", json=payload)
    assert r.status_code == 200, f"login failed: {r.text}"
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


failures = []


def check(name, cond, detail=""):
    status = "PASS" if cond else "FAIL"
    print(f"[{status}] {name} {detail}")
    if not cond:
        failures.append(name)


admin_h = login(ADMIN)

# Ensure test user exists
r = client.post("/api/auth/register", json={
    "name": "Req Test",
    "email": USER["email"],
    "phone": "919999999999",
    "password": USER["password"],
})
if r.status_code not in (200, 201):
    # already registered is fine
    assert "already exists" in r.text, r.text
user_h = login(USER)

# --- Safari: fixed listed price -----------------------------------------
safaris = client.get("/api/safaris").json()
check("safari list non-empty", len(safaris) > 0)
safari = safaris[0]

rooms = 2
r = client.post("/api/requests", json={
    "type": "safari", "item_id": safari["id"], "rooms": rooms,
}, headers=user_h)
check("create safari request 201/200", r.status_code in (200, 201), r.text)
req = r.json()
expected = round(float(safari["price_per_person"]) * rooms, 2)
check("safari amount auto-set to listed price",
      req.get("amount") == expected,
      f"got {req.get('amount')} want {expected}")

req_id = req["id"]

# Accept with an admin-set amount -> honored for any type
r = client.post(f"/api/admin/requests/{req_id}/accept",
                json={"amount": 1, "note": "test"}, headers=admin_h)
check("accept safari 200", r.status_code == 200, r.text)
check("accept honors admin amount for safari",
      r.json().get("amount") == 1,
      f"got {r.json().get('amount')} want 1")

# Set amount on non-custom -> allowed now (admin price override)
r = client.post(f"/api/admin/requests/{req_id}/amount",
                json={"amount": 5}, headers=admin_h)
check("set amount on safari allowed (200)",
      r.status_code == 200, f"status={r.status_code} {r.text}")
check("safari amount updated", r.json().get("amount") == 5,
      f"got {r.json().get('amount')}")

# Mark paid still works (offline/WhatsApp payment)
r = client.post(f"/api/admin/requests/{req_id}/mark-paid",
                json={"amount": expected, "note": "paid on whatsapp"},
                headers=admin_h)
check("mark safari paid 200", r.status_code == 200, r.text)
check("safari paid status", r.json().get("status") == "paid")

# --- Custom plan: admin-set amount allowed -------------------------------
r = client.post("/api/custom-plans", json={
    "travel_days": 3, "safari_type": "Jeep", "safari_date": "2026-12-01",
    "safari_shift": "Morning", "hotel_category": "Deluxe",
    "pickup": True, "village": False, "photography": True,
    "food": True,
}, headers=user_h)
check("create custom plan 201", r.status_code == 201, r.text)
plan_id = r.json()["id"]

r = client.get("/api/requests/my", headers=user_h)
mine = [x for x in r.json() if x["type"] == "custom" and x["item_id"] == plan_id]
check("custom plan created linked request",
      len(mine) == 1, f"found {len(mine)}")
cust = mine[0]
check("custom request amount starts null",
      cust.get("amount") is None, f"amount={cust.get('amount')}")

# Accept custom with an admin-set amount
r = client.post(f"/api/admin/requests/{cust['id']}/accept",
                json={"amount": 45000, "note": "quoted"}, headers=admin_h)
check("accept custom 200", r.status_code == 200, r.text)
check("custom keeps admin amount",
      r.json().get("amount") == 45000,
      f"got {r.json().get('amount')}")

# Set amount later on accepted custom -> allowed
r = client.post(f"/api/admin/requests/{cust['id']}/amount",
                json={"amount": 42000}, headers=admin_h)
check("set amount on accepted custom 200",
      r.status_code == 200, r.text)
check("custom amount updated",
      r.json().get("amount") == 42000)

# User sees it payable in My Requests
r = client.get("/api/requests/my", headers=user_h)
mine = [x for x in r.json() if x["id"] == cust["id"]]
check("user sees accepted custom w/ amount",
      mine and mine[0]["status"] == "accepted"
      and mine[0]["amount"] == 42000)

# User's custom-plan card (My Bookings reads plan.status) stays in sync
r = client.get("/api/custom-plans/my", headers=user_h)
plan_row = [p for p in r.json() if p["id"] == plan_id]
check("plan status synced to accepted",
      plan_row and plan_row[0]["status"] == "accepted",
      f"status={plan_row[0]['status'] if plan_row else 'missing'}")

# Old admin Custom Plans page: reject via plan endpoint -> request syncs too
r = client.patch(f"/api/admin/custom-plans/{plan_id}",
                 json={"status": "rejected"}, headers=admin_h)
check("admin plan-page reject 200", r.status_code == 200, r.text)
check("plan status rejected via plan endpoint",
      r.json().get("status") == "rejected")
r = client.get("/api/requests/my", headers=user_h)
mine = [x for x in r.json() if x["id"] == cust["id"]]
check("linked request rejected too",
      mine and mine[0]["status"] == "rejected",
      f"status={mine[0]['status'] if mine else 'missing'}")

# --- Mark paid directly from "requested" (paid over WhatsApp) -----------
r = client.post("/api/requests", json={
    "type": "safari", "item_id": safari["id"], "rooms": 1,
}, headers=user_h)
check("create second safari request", r.status_code in (200, 201), r.text)
req2 = r.json()

r = client.post(f"/api/admin/requests/{req2['id']}/mark-paid",
                json={"amount": req2["amount"], "note": "paid on whatsapp"},
                headers=admin_h)
check("mark paid straight from requested 200",
      r.status_code == 200, r.text)
check("requested -> paid status",
      r.json().get("status") == "paid",
      f"status={r.json().get('status')}")

print()
if failures:
    print("FAILURES:", failures)
    sys.exit(1)
print("ALL CHECKS PASSED")
