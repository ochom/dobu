from multiprocessing.resource_sharer import stop
import os
from flask import jsonify
import openai
import requests


def requestOpenAi(text):
    print(f"Requesting OpenAI: {text}")
    openai.api_key = os.environ['OPENAI_API_KEY']
    return openai.Completion.create(
        prompt=text,
        model='text-davinci-002',
        temperature=0.9,
        max_tokens=150,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0.6,
        stop=['Patient:', 'Dexter:'],
    ).choices()[0].text
