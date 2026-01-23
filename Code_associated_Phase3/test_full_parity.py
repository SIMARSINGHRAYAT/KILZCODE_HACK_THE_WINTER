import requests
import json
import time

BASE_URL = "http://localhost:8001"

def print_res(resp, label):
    print(f"\n--- {label} ---")
    if resp.status_code == 200:
        print("Status: 200 OK")
        print(json.dumps(resp.json(), indent=2))
    else:
        print(f"Error: {resp.status_code}")
        print(resp.text)

# 1. System Status
resp = requests.get(f"{BASE_URL}/mongo-status")
print_res(resp, "System Status")

# 2. Score Transaction (Netflix)
payload_score = {
    "merchant_id": "mer_netflix",
    "merchant_name": "Netflix",
    "amount": 15.99
}
resp = requests.post(f"{BASE_URL}/score-transaction", json=payload_score)
print_res(resp, "Score Transaction")

# 3. Investigate Transaction (Requires Gemini Key, might fail if not set, but testing route existence)
payload_inv = {
    "merchant_id": "mer_netflix",
    "merchant_name": "Netflix",
    "amount": 15.99,
    "decision": "ALLOW",
    "merchant_trust_score": 95.0,
    "rename_similarity_score": 100,
    "closest_company_match": "Netflix"
}
print("\n--- Testing Investigation (May take a few seconds) ---")
resp = requests.post(f"{BASE_URL}/investigate-transaction", json=payload_inv)
print_res(resp, "Investigate Transaction")
