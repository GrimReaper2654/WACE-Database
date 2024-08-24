template = '''{
    "id": "WACE[y]Q[i]",
    "name": "WACE [y] Question [i]",
    "year": [y],
    "source": "WACE",
    "calculator": "[calc]",
    "tags": []
},'''

calc_assumed = 1
year = 2021
start = 8
end = 17

calc = 'free'
if (calc_assumed):
    calc = 'assumed'
i = start
while i <= end:
    print(template.replace('[i]', str(i)).replace('[y]', str(year)).replace('[calc]', calc))
    i += 1