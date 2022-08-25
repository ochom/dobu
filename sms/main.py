import os
import flask
from flask import request
from flask_cors import CORS
import session
import chatbot
from sms import sendSMS

app = flask.Flask(__name__)
CORS(app)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def home():
    return "hello SMS"


@app.route('/api/v1/sms', methods=['POST'])
def sms():
    # body is a form data
    body = request.form

    # get mobile and message from body
    mobile = body['from']
    question = body['text']
    linkID = body['linkId']

    # chatLog = session.getVal(mobile)

    # answer = chatbot.ask(question, chatLog)
    # session.setVal(mobile, session.appendToChatLog(question, answer, chatLog))
    answer = chatbot.ask(question, session.startChatLog)

    sendSMS(mobile, answer, linkID)
    return answer


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
