import os
import flask
from flask import request
from flask_cors import CORS

from ai import requestOpenAi
from sms import sendSMS

app = flask.Flask(__name__)
CORS(app)
app.config["DEBUG"] = True


sessions = {}


def getOrSetSession(phone, text):
    if phone not in sessions:
        sessions[phone] = os.environ['DEFAULT_TEXT'] + f"\\nPatient: {text}"
    else:
        sessions[phone] += f"\\nPatient: {text}"
    return sessions[phone]


def setSession(phone, text):
    sessions[phone] = text
    return sessions[phone]


@app.route('/', methods=['GET'])
def home():
    return "hello SMS"


@app.route('/api/v1/sms', methods=['POST'])
def sms():
    # body is a form data
    body = request.form

    # get mobile and message from body
    mobile = body['from']
    text = body['text']
    linkID = body['linkId']

    currentText = getOrSetSession(mobile, text)

    res = requestOpenAi(currentText)
    setSession(mobile, res)

    sendSMS(mobile, res, linkID)
    return "ok"


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
