template = '''{
    "id": "WACE2017Q[i]",
    "name": "WACE 2017 Calc Free Question [i]",
    "year": 2017,
    "source": "WACE",
    "calculator": "free",
    "tags": []
},'''

start = 1
end = 8

i = start
while i <= end:
    print(template.replace('[i]', str(i)))
    i += 1