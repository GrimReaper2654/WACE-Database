template = '''{
    "id": "WACE[y]Q[i]",
    "name": "WACE [y] [calc display] Question [i]",
    "year": [y],
    "source": "WACE",
    "calculator": "[calc]",
    "tags": []
},'''

display_calc = True
year = 2018
cf = 9
ca = 11

calc = 'Free'
for i in range(cf):
    print(template.replace('[i]', str(i+1)).replace('[y]', str(year)).replace('[calc]', calc.lower()).replace('[calc display]', f'Calculator {calc}'))

calc = 'Assumed'
for i in range(ca):
    print(template.replace('[i]', str(cf+i+1)).replace('[y]', str(year)).replace('[calc]', calc.lower()).replace('[calc display]', f'Calculator {calc}'))