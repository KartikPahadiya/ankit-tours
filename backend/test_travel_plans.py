import requests
import json

# Login first
r = requests.post(
    'http://127.0.0.1:8000/api/auth/login',
    json={'email': 'admin@travelnest.com', 'password': 'Admin@12345'},
    timeout=5
)
print(f"Login status: {r.status_code}")
token = r.json().get('access_token')
print(f"Token: {token[:20]}...")

# List travel plans
r = requests.get(
    'http://127.0.0.1:8000/api/travel-plans',
    headers={'Authorization': f'Bearer {token}'},
    timeout=5
)
print(f"\nList plans: {r.status_code}")
if r.status_code == 200:
    plans = r.json()
    print(f"  Count: {len(plans)}")
    for p in plans:
        print(f"  - id={p['id']}, title={p['title']}, destination={p['destination']}")

# Create a travel plan
r = requests.post(
    'http://127.0.0.1:8000/api/travel-plans',
    json={
        'title': 'Test Trip',
        'destination': 'Paris',
        'start_date': '2025-06-01',
        'end_date': '2025-06-07',
        'travelers': 2,
        'budget': 2000,
        'travel_style': 'balanced',
        'interests': ['museums', 'food']
    },
    headers={'Authorization': f'Bearer {token}'},
    timeout=5
)
print(f"\nCreate plan: {r.status_code}")
if r.status_code == 201:
    plan = r.json()
    print(f"  id={plan['id']}, title={plan['title']}, destination={plan['destination']}")
    print(f"  travelers={plan['travelers']}, budget={plan['budget']}")
    print(f"  travel_style={plan['travel_style']}, interests={plan['interests']}")

# List again
r = requests.get(
    'http://127.0.0.1:8000/api/travel-plans',
    headers={'Authorization': f'Bearer {token}'},
    timeout=5
)
print(f"\nList plans after create: {r.status_code}")
if r.status_code == 200:
    plans = r.json()
    print(f"  Count: {len(plans)}")

# Get a specific plan
if plans:
    plan_id = plans[0]['id']
    r = requests.get(
        f'http://127.0.0.1:8000/api/travel-plans/{plan_id}',
        headers={'Authorization': f'Bearer {token}'},
        timeout=5
    )
    print(f"\nGet plan {plan_id}: {r.status_code}")
    if r.status_code == 200:
        p = r.json()
        print(f"  title={p['title']}, destination={p['destination']}")

# Test update
if plans:
    plan_id = plans[0]['id']
    r = requests.patch(
        f'http://127.0.0.1:8000/api/travel-plans/{plan_id}',
        json={
            'title': 'Updated Trip',
            'budget': 2500
        },
        headers={'Authorization': f'Bearer {token}'},
        timeout=5
    )
    print(f"\nUpdate plan: {r.status_code}")
    if r.status_code == 200:
        p = r.json()
        print(f"  title={p['title']}, budget={p['budget']}")

# Test delete
if plans:
    plan_id = plans[0]['id']
    r = requests.delete(
        f'http://127.0.0.1:8000/api/travel-plans/{plan_id}',
        headers={'Authorization': f'Bearer {token}'},
        timeout=5
    )
    print(f"\nDelete plan: {r.status_code}")

# List after delete
r = requests.get(
    'http://127.0.0.1:8000/api/travel-plans',
    headers={'Authorization': f'Bearer {token}'},
    timeout=5
)
print(f"\nList plans after delete: {r.status_code}")
if r.status_code == 200:
    plans = r.json()
    print(f"  Count: {len(plans)}")

print("\n=== All travel plan API endpoints tested ===")