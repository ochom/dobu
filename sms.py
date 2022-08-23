import os
from urllib.parse import urlencode
import requests


def sendSMS(phone: str, message: str, linkID: str):
    url = os.environ['SMS_API_URL']
    apiKey = os.environ['SMS_API_KEY']
    userName = os.environ['SMS_API_USERNAME']

    data = urlencode({
        "username": userName,
        "to": phone,
        "message": message.replace('\n', ' '),
        "from": os.environ.get('SHORT_CODE', '2202'),
        "linkId": linkID,
    })

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": apiKey,
    }

    res = requests.post(url, data=data, headers=headers)
    if res.status_code != 201:
        print(f"Error sending SMS: {res.text}")
        return False

    print("SMS sent successfully", res.text)
    return True
