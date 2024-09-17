# Standard Operating Procedure

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
Each question image should not have any borders so the resizing program does not break (background should be fully white). Also crop out any headders and footers, like the page number. Keep the question number and number of marks as that is rather important.<br>
Multiple question parts can be put in the same image, this is fine. Only use multiple images if the questions spans several pages.<br>
If a question requires multiple images as it spans muliple pages, crop out any repeated question numbers like 'Question 1 (continued)'.<br>
If the first (or only) image in the question does not have a question number in the form of `Question n` you will need to manually rename it.<br>
The images would be named WACE2023Q1.1.png, WACE2023Q1.2.png, WACE2023Q1.3.png and so on for a multi part question or simply WACE2023Q1 for a single part question.<br>
If the image contains the question number, there is no need to rename the question. Just make sure you screenshot the parts in order.<br>
Make sure to put the questions in a folder named the organisation followed by the year, a space and a shortened version of the subject so `WACE2023 spec` or `WACE2019 econs` for example. <br>
Put the marking keys in a folder named `key` inside the questions folder. The same requirements for questions apply for the marking keys as well. All images should be .png and the images to be automatically renamed should contain 'screenshot' in their name (can be changed in the python program)<br>
<br>
`screenshotter.py` is avalaible to make screenshotting easier by simplifying the keybind. Just input the keybind for screenshotting and run the program (maybe with sudo if it needs perms). Its a minor time save, but stops your hand from getting as tired so it is quite useful. This program is not necessary though so don't worry if you can't get it working.

### Step 3: Process Questions
If the subject is a math subject and has calc assumed and calc free sections (specialist, methods, applications, etc), put a txt file into the folder with the questions containing the number of calc free questions as an integer. Name this file `calculator.txt`. The script will read this and add calculator free or calculator assumed to the question name. If the file is not present, the program will assume all questions are calculator assumed. <br>
Run `fullAuto.py` and it will handle everything. If you have done the previous step correctly, the program will process and move all the questions and marking keys into the right places as well as add the questions to the database. The questions will not be automatically tagged as that requires people to do it.<br>
If there are any problems, you can manually fix them. There are many python programs lying around in the image processing area that might be useful.

### Step 4: Upload
If you are a contributor, just commit changes and push to main. Otherwise, create a pull request and wait for a contributor to accept.
