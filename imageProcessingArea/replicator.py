#
# For when you want to use the same image for multiple things
#  - Good for copy pasting the same multiple choice marking key for all multi choice questions
#
#
#

import os
from PIL import Image

def replicate():
    src = 'imageProcessingArea/WACEQ1.webp'

    name = 'WACE2022Q'
    start = 1
    end = 25
    image = Image.open(src)

    i = start
    while i <= end:
        image.save(f'imageProcessingArea/{name}{i}.webp')
        print(f'Duplicated {src} as imageProcessingArea/{name}{i}.webp')
        i += 1

def rename():
    src = 'imageProcessingArea/WACEQ[i].webp'
    correct = 'imageProcessingArea/WACE2022Q[i].webp'

    start = 26
    end = 39
    

    i = start
    while i <= end:
        image = Image.open(src.replace('[i]', str(i)))
        image.save(correct.replace('[i]', str(i)))
        os.remove(src.replace('[i]', str(i)))
        print(f"Renamed {src.replace('[i]', str(i))} as {correct.replace('[i]', str(i))}")
        i += 1 


rename()

