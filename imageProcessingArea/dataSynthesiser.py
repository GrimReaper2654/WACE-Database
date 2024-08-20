template = '''{
    "id": "WACE[y]Q[i]",
    "name": "WACE [y] Question [i]",
    "year": [y],
    "source": "WACE",
    "calculator": "assumed",
    "tags": []
},'''

year = 2022
start = 1
end = 39

i = start
while i <= end:
    print(template.replace('[i]', str(i)).replace('[y]', str(year)))
    i += 1