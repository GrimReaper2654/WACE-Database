import os
import shutil
import pytesseract
import re
from PIL import Image
from datetime import datetime

# Set the path to the Tesseract executable (update this according to your installation)
pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'

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
    return None

def extract_datetime_from_filename(filename):
    # Example filename format: 'Screenshot 2024-09-01 at 18.57.16.png'
    # Split to get the datetime part: '2024-09-01 at 18.57.16'
    date_part = re.sub(r'(\d)[^\d]*$', r'\1', filename.replace('Screenshot', '').replace('.png', '').replace('am', '').replace('pm', '').replace(' ', '').replace('\u202f', '').replace('at', ' '))
    # Convert to a datetime object
    return datetime.strptime(date_part, "%Y-%m-%d %H.%M.%S")

def rename_images(directory, template):
    # Get a list of all .png files in the directory sorted by creation time (oldest first)
    images = [f for f in os.listdir(directory) if f.endswith('.png') and 'Screenshot' in f]
    #images.sort(key=lambda x: os.path.getctime(os.path.join(directory, x)))
    images = sorted(images, key=extract_datetime_from_filename)

    question_parts = {}  # To track the number of parts for each question
    prev_question_number = 0
    isMCQ = True

    for image in images:
        if (not 'Screenshot' in image): # remove this if your input images do not contain 'screenshot'. This is here so already remaned questions are not renamed again.
            continue
        image_path = os.path.join(directory, image)
        text = get_text_from_image(image_path)
        question_number = extract_question_number(text)

        if question_number is not None:
            isMCQ = False

        if not question_number and isMCQ:
            question_number = prev_question_number + 1
            while os.path.exists(f'{template}Q{question_number}.png') or os.path.exists(f'{template}Q{question_number}.1.png'):
                question_number += 1
                prev_question_number += 1
                
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
        print(f"IMAGE RENAMER: Renamed {image_path.rsplit('/', 1)[-1]} --> {new_image_path.rsplit('/', 1)[-1]}")
    
    for question_number in question_parts:
        if question_parts[question_number] > 1:
            old_filename = f'{template}Q{question_number}.png'
            new_filename = f'{template}Q{question_number}.1.png'
            old_image_path = os.path.join(directory, old_filename)
            new_image_path = os.path.join(directory, new_filename)
            shutil.move(old_image_path, new_image_path)
            print(f"IMAGE RENAMER: Renamed {old_image_path.rsplit('/', 1)[-1]} --> {new_image_path.rsplit('/', 1)[-1]}")
    
    print(f"IMAGE RENAMER: All images renamed")

# Read the contents of info.txt to get the template
directory = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(directory, "info.txt"), "r") as file:
    template = file.read().strip()
    if template == '':
        raise FileNotFoundError

# Proceed with renaming the images using the template
rename_images(directory, template)
