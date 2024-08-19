#
# For when you want to use the same image for multiple things
#  - Good for copy pasting the same multiple choice marking key for all multi choice questions
#
#
#

import os
from PIL import Image

src = 'imageProcessingArea/WACE2023Q.webp'

name = 'WACE2023Q'
start = 1
end = 24
image = Image.open(src)

i = start
while i <= end:
    image.save(f'imageProcessingArea/{name}{i}.webp')
    print(f'Duplicated {src} as imageProcessingArea/{name}{i}.webp')
    i += 1