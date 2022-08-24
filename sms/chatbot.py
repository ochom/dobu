import os
import openai
import session


openai.api_key = os.environ['OPENAI_API_KEY']
completion = openai.Completion()


def ask(question, chatLog):
    prompt = f'{chatLog}Human: {question}\nAI:'
    req = completion.create(
        prompt=prompt,
        engine='davinci',
        temperature=0.9,
        max_tokens=150,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0.6,
        best_of=1,
        stop=['Human']
    )

    answer = req.choices[0].text

    return answer
