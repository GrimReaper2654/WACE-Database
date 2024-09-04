#
# For making pdf downloads of questions, run before stacking
#  
#
#
#

import os
from PIL import Image
from fpdf import FPDF

# Define the folder path (the folder containing this script)
folder_path = os.path.dirname(os.path.realpath(__file__))

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

# Process each group to create a PDF
for base_id, files in image_groups.items():
    # Sort the files based on their position (ext value)
    files.sort(key=lambda x: x[1])

    # Initialize PDF
    pdf = FPDF('P', 'mm', 'A4')
    pdf.set_auto_page_break(auto=False)

    # Add each image to the PDF
    for file in files:
        webp_path = os.path.join(folder_path, file[0])
        jpeg_path = os.path.join(folder_path, file[0].replace(".webp", ".jpeg"))

        # Convert webp to jpeg with white background
        with Image.open(webp_path) as img:
            # Ensure the image is in RGBA mode to handle transparency
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                # Create a white background image
                background = Image.new("RGBA", img.size, (255, 255, 255, 255))
                # Paste the original image on top of the white background
                background.paste(img, (0, 0), img.convert("RGBA"))
                # Convert to RGB and save as JPEG
                img = background.convert("RGB")
            else:
                # If no transparency, just convert to RGB
                img = img.convert("RGB")
            
            img.save(jpeg_path, "JPEG")

        # Convert image size to fit the width of the PDF page, respecting margins
        pdf_w = 210  # A4 width in mm
        margin = 10  # Standard margin in mm
        max_w = pdf_w - 2 * margin

        with Image.open(jpeg_path) as img:
            w_percent = max_w / float(img.size[0])
            h_size = int(float(img.size[1]) * float(w_percent))

        # Add a page and place the image at the top
        pdf.add_page()
        pdf.image(jpeg_path, x=margin, y=10, w=max_w, h=h_size)

        # Remove the temporary jpeg file
        os.remove(jpeg_path)

    # Save the PDF with the base ID as the filename
    pdf_output_path = os.path.join(folder_path, base_id + ".pdf")
    pdf.output(pdf_output_path)

    print(f"PDF MAKER: Created pdf download for question {pdf_output_path.split('/')[-1].split('.')[0]}")

print("PDF MAKER: All PDFs created")
