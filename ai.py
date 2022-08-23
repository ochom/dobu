import os
import openai


def requestOpenAi(text):
    print("Requesting OpenAI: ", text)
    openai.api_key = os.environ['OPENAI_API_KEY']
    req = openai.Completion.create(
        prompt=text,
        model='text-davinci-002',
        temperature=0.9,
        max_tokens=150,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0.6,
    )

    print(f"OpenAI response: {req.choices[0].text}")

    return req.choices[0].text
