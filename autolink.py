a = 'kys lmao'

data = []
while 1:
    a = input("Data: ")
    if a == 'e':
        break
    if a == 'r':
        data.pop()
        continue
    if a == '':
        b = data[-1][0] + 1
        c = data[-1][1] + 1
        print(b, c)
    elif ' ' in a:
        b, c = a.split(' ')
    else:
        c = input("2nd:  ")
        b = a
    data.append([int(b), int(c)])

d = str(data).replace(' ', '')
print(d[1:-1])
