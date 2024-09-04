#
# First step in image processing
#  - turns .png into .webp and crops them
#
#
#

import os
from PIL import Image

# Define the folder path (the folder containing this script)
folder_path = os.path.dirname(os.path.realpath(__file__))

# Iterate over all files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".png") or filename.endswith(".PNG"):
        # Construct full file path
        input_image_path = os.path.join(folder_path, filename)
        
        # Open the image
        image = Image.open(input_image_path).convert("RGBA")

        # Make all white pixels transparent
        datas = image.getdata()
        new_data = []
        for item in datas:
            if item[0] > 245 and item[1] > 245 and item[2] > 245 and item[3] > 0:  # RGBA format
                new_data.append((255, 255, 255, 0))  # Set alpha to 0 (transparent)
            else:
                new_data.append(item)
        image.putdata(new_data)

        # Crop the image so that there is a colored pixel touching each edge
        bbox = image.getbbox()  # Find the bounding box of non-white areas
        cropped_image = image.crop(bbox)

        # Create the output image path (same name, but with .webp extension)
        output_image_path = os.path.join(folder_path, os.path.splitext(filename)[0] + ".webp")

        # Save the image as a .webp file with maximum quality
        cropped_image.save(output_image_path, "WEBP", quality=100, lossless=True)

        # Delete the original image
        os.remove(input_image_path)
        print(f"IMAGE PROCESSOR: Cleaned and cropped {filename} --> {filename.rsplit('.', 1)[0]}.webp")

print("IMAGE PROCESSOR: All images processed and replaced")
