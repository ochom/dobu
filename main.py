import os
import flask
from flask import request
from flask_cors import CORS

from service import requestOpenAi
from sms import sendSMS

app = flask.Flask(__name__)
CORS(app)
app.config["DEBUG"] = True


sessions = {}


@app.route('/', methods=['GET'])
def home():
    return "hello SMS"


@app.route('/api/v1/sms', methods=['POST'])
def sms():
    print(request.data)
    body = request.get_json()
    mobile = body['from']
    text = body['text']

    print(f"Received SMS from {mobile}: {text}")

    currentText = sessions.get(mobile, os.environ['DEFAULT_TEXT'])
    sessions[mobile] = currentText + f"\nPatient: {text}"

    res = requestOpenAi(currentText)
    sessions[mobile] += res
    sendSMS(mobile, res)
    return "ok"


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
