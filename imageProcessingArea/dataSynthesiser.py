template = '''{
    "id": "WACE[y]Q[i]",
    "name": "WACE [y] Question [i]",
    "year": [y],
    "source": "WACE",
    "calculator": "assumed",
    "tags": []
},'''

year = 2022
start = 7
end = 15

i = start
while i <= end:
    print(template.replace('[i]', str(i)).replace('[y]', str(year)))
    i += 1