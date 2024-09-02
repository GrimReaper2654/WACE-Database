template = '''{
    "id": "WACE[y]Q[i]",
    "name": "WACE [y] Question [i]",
    "year": [y],
    "source": "WACE",
    "calculator": "[calc]",
    "tags": []
},'''

year = 2017
cf = 9 
ca = 11 # haha funny

calc = 'Free'
for i in range(cf):
    print(template.replace('[i]', str(i+1)).replace('[y]', str(year)).replace('[calc]', calc.lower()).replace('[calc display]', f'Calculator {calc}'))

calc = 'Assumed'
for i in range(ca):
    print(template.replace('[i]', str(cf+i+1)).replace('[y]', str(year)).replace('[calc]', calc.lower()).replace('[calc display]', f'Calculator {calc}'))