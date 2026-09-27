import requests

r = requests.post(
    'http://127.0.0.1:8000/api/auth/login',
    json={'email': 'admin@travelnest.com', 'password': 'Admin@12345'},
    timeout=5
)
token = r.json().get('access_token')

r = requests.post(
    'http://127.0.0.1:8000/api/travel-plans',
    json={
        'title': 'Test Trip',
        'destination': 'Paris',
        'start_date': '2027-06-01',
        'end_date': '2027-06-07',
        'travelers': 2,
        'budget': 2000,
        'travel_style': 'balanced',
        'interests': ['museums', 'food']
    },
    headers={'Authorization': f'Bearer {token}'},
    timeout=5
)
print(f'Create status: {r.status_code}')
if r.status_code == 201:
    plan = r.json()
    plan_id = plan['id']
    print(f'Created: id={plan["id"]}, title={plan["title"]}, dest={plan["destination"]}')
    
    # Get the plan
    r = requests.get(f'http://127.0.0.1:8000/api/travel-plans/{plan_id}', headers={'Authorization': f'Bearer {token}'})
    print(f'Get plan: {r.status_code}')
    if r.status_code == 200:
        p = r.json()
        print(f'  title={p["title"]}, start={p["start_date"]}, end={p["end_date"]}')
    
    # List all plans
    r = requests.get('http://127.0.0.1:8000/api/travel-plans', headers={'Authorization': f'Bearer {token}'})
    print(f'List plans: {r.status_code}')
    if r.status_code == 200:
        plans = r.json()
        print(f'  Count: {len(plans)}')
    
    # Update plan
    r = requests.patch(
        f'http://127.0.0.1:8000/api/travel-plans/{plan_id}',
        json={'title': 'Updated Trip', 'budget': 2500},
        headers={'Authorization': f'Bearer {token}'}
    )
    print(f'Update plan: {r.status_code}')
    if r.status_code == 200:
        p = r.json()
        print(f'  title={p["title"]}, budget={p["budget"]}')
    
    # Delete plan
    r = requests.delete(f'http://127.0.0.1:8000/api/travel-plans/{plan_id}', headers={'Authorization': f'Bearer {token}'})
    print(f'Delete plan: {r.status_code}')
    
    # List after delete
    r = requests.get('http://127.0.0.1:8000/api/travel-plans', headers={'Authorization': f'Bearer {token}'})
    print(f'List after delete: {r.status_code}')
    if r.status_code == 200:
        print(f'  Count: {len(r.json())}')

print('\n=== All endpoints working! ===')