#
# For combining all the part questions into a full image
#  
#
#
#

import os
from PIL import Image

# Define the folder path (the folder containing this script)
folder_path = os.path.dirname(os.path.realpath(__file__))
gap_size = 10  # Define the gap size in pixels

# Group images by their ID
image_groups = {}

# Iterate over all .webp files in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".webp"):
        # Split the filename to extract base ID and position (if any)
        parts = os.path.splitext(filename)[0].split(".", 1)
        base_id = parts[0]
        ext = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
        
        # Add the file to the appropriate group
        if base_id not in image_groups:
            image_groups[base_id] = []
        image_groups[base_id].append((filename, ext))

# Process each group
for base_id, files in image_groups.items():
    if len(files) == 1:
        # If there's only one image, no need to stack, just leave it as is
        continue
    else:
        # Sort the files based on their position (ext value)
        files.sort(key=lambda x: x[1])

        # Open all images and calculate total height and width
        images = [Image.open(os.path.join(folder_path, file[0])) for file in files]
        total_height = sum(image.height for image in images) + gap_size * (len(images) - 1)
        max_width = max(image.width for image in images)

        # Create a new image with the calculated size
        combined_image = Image.new("RGBA", (max_width, total_height), (255, 255, 255, 0))

        # Paste each image into the combined image
        y_offset = 0
        for image in images:
            combined_image.paste(image, (0, y_offset))
            y_offset += image.height + gap_size

        # Save the combined image
        combined_image_path = os.path.join(folder_path, base_id + ".webp")
        combined_image.save(combined_image_path, "WEBP", quality=100, lossless=True)

        # Delete the original individual images
        for image_file, _ in files:
            os.remove(os.path.join(folder_path, image_file))

        print(f"IMAGE STACKER: Combined and saved {combined_image_path.split('/')[-1].split('.')[0]}")

print("IMAGE STACKER: All question images stacked")
