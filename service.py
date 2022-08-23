import os

import openai
import openai


def requestOpenAi(text):
    openai.api_key = os.environ['OPENAI_API_KEY']
    req = openai.Completion.create(
        model='text-davinci-002',
        prompt=text,
        max_tokens=150,
        temperature=0.8,
    )
    return req.choices[0].text
