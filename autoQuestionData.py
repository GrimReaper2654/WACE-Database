template = '''{
    "id": "WACE2023Q[i]",
    "name": "WACE 2023 Question [i]",
    "year": 2023,
    "source": "WACE",
    "calculator": "assumed",
    "tags": []
},'''

start = 1
end = 31

i = start
while i <= end:
    print(template.replace('[i]', str(i)))
    i += 1