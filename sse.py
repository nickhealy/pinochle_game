from sseclient import SSEClient

messages = SSEClient('http://localhost:5000/listen/12345')

for msg in messages:
    print(msg)
