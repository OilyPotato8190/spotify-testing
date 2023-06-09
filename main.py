import requests
response = requests.put(
    url="http://localhost:3000/sendQuery", data="query", headers={'Content-Type': 'text/plain'})
