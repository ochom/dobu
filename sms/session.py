import redis
import os

r = redis.Redis(host=os.environ['REDIS_HOST'],
                port=os.environ['REDIS_PORT'], db=0)

botName = "Dexter"
hospitalName = "DoBu Hospital"
ussdCode = os.environ['USSD_CODE']
knownInformation = f"{botName} is a chatbot of {hospitalName}. {botName} can prescribe medicines to you. {botName} can also help you with your health issues."
# knownInformation = f"Dexter is a medical chatbot for the hospital named DOBU. Dexter can advice on health issues and sometimes responds sarcastically. To see a doctor, Dexter recommends USSD {os.environ['USSD_CODE']}"
startChatLog = f"{knownInformation}\nHuman:Hello?\nDexter: Hi, how can I help you today?\n"


def appendToChatLog(question, answer, chatLog):
    return f'{chatLog}Human: {question}\nDexter: {answer}\n'


def getVal(phone) -> str:
    d = r.get(phone)
    if d is None:
        return startChatLog
    else:
        return d.decode()


def setVal(phone, text):
    r.set(phone, text, ex=600)
