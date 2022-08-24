import redis
import os

r = redis.Redis(host=os.environ['REDIS_HOST'],
                port=os.environ['REDIS_PORT'], db=0)


knownInformation = f"KNOWN: if a user wants to get or see a doctor. they can dial {os.environ['USSD_CODE']}"
startChatLog = f'{knownInformation}\nHuman: Hello how are you?\nAI: I am doing great. How can I help you today?\n'


def appendToChatLog(question, answer, chatLog):
    return f'{chatLog}Human: {question}\nAI: {answer}\n'


def getVal(phone) -> str:
    d = r.get(phone)
    if d is None:
        return startChatLog
    else:
        return d.decode()


def setVal(phone, text):
    r.set(phone, text, ex=600)
