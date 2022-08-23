import os
import flask
from flask import request, jsonify

from service import requestOpenAi

app = flask.Flask(__name__)
app.config["DEBUG"] = True


sessions = {}


@app.route('/', methods=['GET'])
def home():
    return "hello SMS"


@app.route('/api/v1/sms', methods=['POST'])
def sms():
    mobile = request.args.get('mobile')
    currentText = sessions.get(mobile, 'Hello Doctor!')
    sessions[mobile] = currentText

    res = requestOpenAi(currentText)
    sessions[mobile] += res
    return jsonify({'text': res})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
