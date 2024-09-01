# WACE-Database by MacELine™
We plan on hosting a large collection of resources for the WACE exam. We have a database of tagged and filterable practice questions for a variety of ATAR subjects from past WACE exams as well as some simple study tools, some of which we created and can not be found anywhere else. If you are a year 11 / 12 student preparing for ATAR, this respostory could help you out, whether you are revising for smaller tests or exams. We could also use your help if you are intrested in expanding this project or wish to help out fellow students through the most challenging years of high school. <br>
Feel free to email me if you are interested in joining, alternatively create a pull request with things you want to add. <br><br>
Also MacELine™ is not a real company. <br>
We have a discord now: https://discord.gg/ydSxYFNv

**Site can be accessed from:**<br>
https://wacedatabase.pages.dev/  (most up to date)<br>
https://grimreaper2654.github.io/WACE-Database/  (updates slower) <br><br>
A localhost of a clone of the repo would work as well and can function without internet. 

**Not all questions have been added and tagged yet, wace database is still under construction.**

# Contributing Guide
We are in need of people who are willing to help us set tags for questions as well as upload more questions. A guide for doing both of these is below. If you have contributions to make, create a pull request and a contributor will accept it. Tagging questions can be done on github's online editor, but scanning the questions requires a decently good moniter as well as python installed. We are working on a more automated method of scanning questions but having python is still going to be necessary.

## How to Set Tags

### Setting Tags
Go to https://wacedatabase.pages.dev/dev <br>
Everything needed for setting tags is there. You will need a github account in order to create a token with full repo access, which you can then input into the site. Then select a question using the search function, filtering by year is usually good as it separates the questions into more managable chunks. The footer will show the possible tags of the question, which you can click to add and remove. Your changes will be saved until you leave the page. After making all your changes, the site will automatically create a pull request when you press the `Submit Pull Request` button. Then, wait for the site to update (check the repo or the discord server) and reload to see your changes. Alternatively, you can modify `questions.json` and create a pull request manually if you don't want to use the built in tagging system.

## A Guide to Processing Questions

### Step 1: Download Python Libraries
It is strongly recommended to install python and the required libraries from `requirements.txt`. <br>
Otherwise, you will have to manually photoshop the images which is rather time consuming. <br>
For those who don't want to use python, just manually do what is described in the steps (may take several hours per exam).

### Step 2: Get Questions
Open the past paper pdf that you found online and screenshot the individual questions. <br>
Each question image should not have any borders so the resizing program does not break. Also crop out any headders and footers, like the page number. Keep the question number and number of marks as that is rather important.<br>
Multiple question parts can be put in the same image, this is fine. Only use multiple images if the questions spans several pages.<br>
If a question requires multiple images as it spans muliple pages, crop out any repeated question numbers like 'Question 1 (continued)'.<br>
If the first (or only) image in the question does not have a question number in the form of `Question n` you will need to manually rename it.<br>
The images would be named WACE2023Q1.1.png, WACE2023Q1.2.png, WACE2023Q1.3.png and so on for a multi part question or simply WACE2023Q1 for a single part question.<br>
If the image contains the question number, there is no need to rename the question. Just make sure you screenshot the parts in order.<br>
Make sure to only get the questions and NOT the marking keys as well. All images should be .png and the images to be automatically renamed should contain 'screenshot' in their name (can be changed in the python program)<br>
<br>
`screenshotter.py` is avalaible to make screenshotting easier by simplifying the keybind. Just input the keybind for screenshotting and run the program (maybe with sudo if it needs perms). Its a minor time save, but stops your hand from getting as tired so it is quite useful. THis program is not necessary though so don't worry if you can't get it working.

### Step 3: Process Images
Edit the template variable in `renamer.py`, don't worry if you forget, it is still salvageable. <br>
Make sure you have all the questions in the image processing folder, then run `questionProcessing.py`. This will automatically process all the images. It will delete your screenshots and replace them with question PDFs and .webp images. When the program is complete, there will be a message logged to the terminal as well as a robot voice telling you that it has finished. This audio sometimes breaks if python is not focused. <br>
After processing is finished, move the PDFs into the PDF downloads folder under the correct subject and move the WEBPs into the question bank under the correct subject.

### Step 4: Get Marking Keys
Repeat step 2 but for the marking keys. Use the same naming format. Each marking key and question should have the same name but are in different folders so they do not conflict.<br>
Put the marking key images into the image processing folder which should not have any images in it at this stage. <br>

### Step 5: Process Marking Keys
Run `keyProcessing.py` on the marking keys. The output images can then be moved to the markingKeys folder under the correct subject folder. 

### Step 6: Add Question Data
Open `dataSynthesiser.py` and edit the template until the question data is correct. The question data will be outputed to the terminal and can be copy pasted into `questions.json`. <br>
If you want to set tags, add the tags to the tags array for each question. Its fine if you don't want to do tags, somebody else will have to do them.<br>
This step can be done while your questions or marking keys are being processed. Just need to open a new terminal to run the program.

### Step 7: Upload
If you are a contributor, just commit changes and push to main. Otherwise, create a pull request and wait for a contributor to accept.
