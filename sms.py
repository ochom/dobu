import os
from urllib.parse import urlencode
import requests


def sendSMS(phone, message):
    print(f"Sending SMS to {phone}: {message}")
    url = os.environ['SMS_API_URL']
    apiKey = os.environ['SMS_API_KEY']
    userName = os.environ['SMS_API_USERNAME']

    data = urlencode({
        "username": userName,
        "to": phone,
        "message": message,
        "from": os.environ.get('SHORT_CODE', '2202'),
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

    print("SMS sent successfully")
    return True
