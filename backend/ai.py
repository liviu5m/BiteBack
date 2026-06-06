from groq import Groq

client = Groq()


def getProductByAllMatches():
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": ""}],
        temperature=1,
        max_completion_tokens=8192,
        top_p=1,
        reasoning_effort="medium",
        stream=True,
        stop=None,
    )

    for chunk in completion:
        print(chunk.choices[0].delta.content or "", end="")
    return completion
