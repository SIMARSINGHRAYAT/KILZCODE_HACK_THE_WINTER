from fastapi import APIRouter
from fastapi import APIRouter

router = APIRouter()

@router.get("/payment-site/merchants")
def get_payment_site_merchants():
    """
    Returns a list of merchants for the frontend dropdown.
    In a real app, this would be a specific subset.
    Here we take top 20 known merchants from CSV loader.
    """
    # Simply return a hardcoded list or access CSVLoader keys
    # Accessing container.csv_loader.merchant_lookup
    
    # Let's return a curated list for the demo site + some scraped ones
    return [
        {"id": "mer_netflix", "name": "Netflix Inc"},
        {"id": "mer_spotify", "name": "Spotify AB"},
        {"id": "mer_adobe", "name": "Adobe Systems"},
        {"id": "mer_aws", "name": "Amazon Web Services"},
        {"id": "mer_vpn", "name": "ExpressVPN"},
        {"id": "mer_unknown", "name": "Random Sketchy Site"},
        {"id": "mer_fuzzy", "name": "Netfl1x Premium"}
    ]
