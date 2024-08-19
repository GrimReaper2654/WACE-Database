template = '''{
    "id": "WACE2023Q[i]",
    "name": "WACE 2023 Question [i]",
    "year": 2023,
    "source": "WACE",
    "calculator": "assumed",
    "tags": []
},'''

start = 6
end = 14

i = start
while i <= end:
    print(template.replace('[i]', str(i)))
    i += 1