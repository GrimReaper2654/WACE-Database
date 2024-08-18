template = '''{
    "id": "WACE2023Q[i]",
    "name": "WACE 2023 Calc Assumed Question [i]",
    "year": 2023,
    "source": "WACE",
    "calculator": "assumed",
    "tags": []
},'''

start = 10
end = 19

i = start
while i <= end:
    print(template.replace('[i]', str(i)))
    i += 1