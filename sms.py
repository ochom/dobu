import os
from urllib.parse import urlencode
import requests


def sendSMS(phone, message):
    print("Sending SMS to {}: {}".format(phone, message))
    url = os.environ['SMS_API_URL']
    apiKey = os.environ['SMS_API_KEY']
    userName = os.environ['SMS_USER_NAME']

    data = urlencode({
        "username": userName,
        "to": phone,
        "message": message,
        "from": "2202",
    })

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apikey": apiKey,
    }

    res = requests.post(url, data=data, headers=headers)
    if res.status_code != 200:
        print("Error sending SMS: {}".format(res.text))
        return False

    print("SMS sent successfully")
    return True
