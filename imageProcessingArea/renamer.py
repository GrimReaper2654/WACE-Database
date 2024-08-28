import os
import shutil
from datetime import datetime
from PIL import Image
import pytesseract
import re

# Set the path to the Tesseract executable (update this according to your installation)
pytesseract.pytesseract.tesseract_cmd = '/usr/local/bin/tesseract'

def get_text_from_image(image_path):
    # Open the image file
    image = Image.open(image_path)

    # Use Tesseract to do OCR on the image
    text = pytesseract.image_to_string(image)

    return text

def extract_question_number(text):
    # Extract the question number from the text
    match = re.search(r'Question (\d+)', text)
    if match:
        return int(match.group(1))
    match = re.search(r'^\s*(\d+)\.', text)
    if match:
        return int(match.group(1))
    return None

def rename_images(directory, template):
    # Get a list of all .png files in the directory sorted by creation time (oldest first)
    images = [f for f in os.listdir(directory) if f.endswith('.png')]
    images.sort(key=lambda x: os.path.getctime(os.path.join(directory, x)))

    question_parts = {}  # To track the number of parts for each question
    prev_question_number = 0

    print(images)

    for image in images:
        if (not 'Screenshot' in image): # remove this if your input images do not contain 'screenshot'. This is here so already remaned questions are not renamed again.
            continue
        image_path = os.path.join(directory, image)
        text = get_text_from_image(image_path)
        question_number = extract_question_number(text)

        if question_number is not None:
            question_parts[question_number] = 1
            prev_question_number = question_number
            image_id = f'Q{question_number}'
        else:
            # Continuation of the previous question
            question_parts[prev_question_number] += 1
            image_id = f'Q{prev_question_number}.{question_parts[prev_question_number]}'

        # Rename the file
        new_filename = f'{template}{image_id}.png'
        new_image_path = os.path.join(directory, new_filename)
        shutil.move(image_path, new_image_path)
        print(f"Renamed {image_path.rsplit('/', 1)[-1]} to {new_image_path.rsplit('/', 1)[-1]}")
    
    for question_number in question_parts:
        if question_parts[question_number] > 1:
            old_filename = f'{template}Q{question_number}.png'
            new_filename = f'{template}Q{question_number}.1.png'
            old_image_path = os.path.join(directory, old_filename)
            new_image_path = os.path.join(directory, new_filename)
            shutil.move(old_image_path, new_image_path)
            print(f"Renamed {old_image_path.rsplit('/', 1)[-1]} to {new_image_path.rsplit('/', 1)[-1]}")

# Example usage
directory = os.path.dirname(os.path.abspath(__file__))
template = 'WACE2023'
rename_images(directory, template)
