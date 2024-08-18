template = '''{
    "id": "WACE2021Q[i]",
    "name": "WACE 2021 Question [i]",
    "year": 2021,
    "source": "WACE",
    "calculator": "assumed",
    "tags": []
},'''

start = 1
end = 21
# 20 19 21
i = start
while i <= end:
    print(template.replace('[i]', str(i)))
    i += 1