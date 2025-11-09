import requests
from core.config import settings

def get_user_info(user_id: str):
    '''
    url = f"{settings.AUTH_SERVICE_URL}/users/{user_id}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None
    '''

    return {"id": user_id, "role": "organizer"}
