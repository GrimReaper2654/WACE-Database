'''
----------------------------------------- Important -----------------------------------------

Images to be processed should be formatted like this:
 • .zip file in the imageProcessing folder
 • .zip file named subject followed by organisation and year. Space after subject. 
   e.g. "meth WACE2023" or "phys WACE2019"
 • .zip file unzips to a folder
     • folder should contain question images
     • a txt file named "calculator.txt" containing the number of calc free questions. 
       Skip this if it is not a math exam.
     • a folder named "key" containing marking key images

More info can be found in the Standard Operating Procedure (SOP.md) (slightly out of date)

---------------------------------------------------------------------------------------------
'''

import os
import zipfile
import shutil
import glob
import subprocess
import sys
import time
import simpleaudio as sa

def automate_question_database():
    # get python executable
    python_cmd = sys.executable

    # Get the current working directory
    root = os.getcwd()
    cwd = os.path.dirname(os.path.abspath(__file__))
    
    # Find all zip files in the current directory
    zip_files = glob.glob(os.path.join(cwd, "*.zip"))
    print(zip_files)

    # Process each zip file individually
    for zip_file in zip_files:
        # Split the zip file name into subject and template
        subject, info = zip_file.split(' ', 1)
        subject = subject.split('/')[-1]
        info = info.split('.', 1)[0]
        
        # Write the subject to subject.txt
        with open(os.path.join(cwd, 'subject.txt'), "w") as subject_file:
            subject_file.write(subject)

        # Write the other info to info.txt
        with open(os.path.join(cwd, 'info.txt'), "w") as info_file:
            info_file.write(info)

        # Unzip the file
        print('Unzipping Folder')
        with zipfile.ZipFile(zip_file, 'r') as zip_ref:
            # Properly extract the folder name from the zip file
            unzipped_folder = os.path.splitext(zip_file)[0]
            
            # Extract all contents into the unzipped folder
            zip_ref.extractall(cwd)
        time.sleep(1)

        # Path to the __MACOSX folder
        macosx_folder = os.path.join(unzipped_folder, "__MACOSX")

        # If the __MACOSX folder exists, delete it
        if os.path.exists(macosx_folder):
            shutil.rmtree(macosx_folder)
        
        # Define the path to calculator.txt in the unzipped folder
        calculator_path = os.path.join(unzipped_folder, "calculator.txt")

        # Check if calculator.txt exists in the unzipped folder
        if os.path.exists(calculator_path):
            # Move calculator.txt to the current working directory
            shutil.move(calculator_path, cwd)

        # Move all .png images from the unzipped folder to the current directory
        for png_file in glob.glob(os.path.join(unzipped_folder, "*.png")): 
            shutil.move(png_file, cwd)
        
        # Run the questionProcessing.py program
        time.sleep(1)
        print('Processing Questions')
        subprocess.run([python_cmd, os.path.join(cwd, 'questionProcessing.py')], check=True)
        print('Finished Processing Questions')
        time.sleep(1)

        # Move all generated .webp images to the questionBank folder in the root directory
        os.makedirs(os.path.join(cwd, "../questionBank"), exist_ok=True)
        for webp_file in glob.glob("*.webp"):
            shutil.move(webp_file, os.path.join(cwd, "../questionBank"))

        # Run the advDataSynthesiser.py program
        time.sleep(1)
        print('Making Question Data')
        subprocess.run([python_cmd, os.path.join(cwd, 'advDataSynthesiser.py')], check=True)
        print('Finished Making Question Data')
        time.sleep(1)
        
        # Move all generated .pdf files to the pdfDownloads folder in the root directory
        os.makedirs(os.path.join(cwd, "../pdfDownloads"), exist_ok=True)
        for pdf_file in glob.glob("*.pdf"):
            shutil.move(pdf_file, os.path.join(cwd, "../pdfDownloads"))
        
        # Move all .png images from the 'key' folder to the current directory
        key_folder = os.path.join(unzipped_folder, "key")
        for png_file in glob.glob(f"{key_folder}/*.png"):
            shutil.move(png_file, cwd)
     
        # Run the keyProcessing.py program
        time.sleep(1)
        print('Processing Keys')
        subprocess.run([python_cmd, os.path.join(cwd, 'keyProcessing.py')], check=True)
        print('Finished Processing Keys')
        time.sleep(1)

        # Move all generated .webp images to the markingKeys folder in the root directory
        os.makedirs(os.path.join(cwd, "../markingKeys"), exist_ok=True)
        for webp_file in glob.glob("*.webp"):
            shutil.move(webp_file, os.path.join(cwd, "../markingKeys"))
        
        # Delete the unzipped folder and the zip file
        #shutil.rmtree(unzipped_folder)
        #os.remove(zip_file)

        # Define the path to calculator.txt in the current working directory
        calculator_path = os.path.join(cwd, "calculator.txt")

        # Check if calculator.txt exists in the current working directory
        #if os.path.exists(calculator_path):
            # Delete the file
            #os.remove(calculator_path)

        # wait for a bit
        time.sleep(1)

    # remind the user processing has finished
    print('Processing Complete')
    wave_obj = sa.WaveObject.from_wave_file(os.path.join(cwd, 'audio.wav'))
    play_obj = wave_obj.play()
    play_obj.wait_done()

# Run the automation function
automate_question_database()

