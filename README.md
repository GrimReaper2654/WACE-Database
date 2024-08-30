# WACE-Database by MacELine™
We plan on hosting a large collection of resources for the WACE exam. We have a database of tagged and filterable practice questions for a variety of ATAR subjects from past WACE exams as well as some simple study tools, some of which we created and can not be found anywhere else. If you are a year 11 / 12 student preparing for ATAR, this respostory could help you out, whether you are revising for smaller tests or exams. We could also use your help if you are intrested in expanding this project or wish to help out fellow students through the most challenging years of high school. <br>
Feel free to email me if you are interested in joining, alternatively create a pull request with things you want to add. <br><br>
Also MacELine™ is not a real company. <br>
We have a discord now: https://discord.gg/ydSxYFNv

**Site can be accessed from:**<br>
https://wacedatabase.pages.dev/ (most up to date)<br>
https://grimreaper2654.github.io/WACE-Database/  (updates slower) <br><br>
A localhost of a clone of the repo would work as well and can function without internet. 

**Not all questions have been added and tagged yet, wace database is still under construction.**

# Contributing Guide
We are in need of people who are willing to help us set tags for questions as well as upload more questions. A guide for doing both of these is below. If you have contributions to make, create a pull request and a contributor will accept it. Tagging questions can be done on github's online editor, but scanning the questions requires a decently good moniter as well as python installed. We are working on a more automated method of scanning questions but having python is still going to be necessary.

## How to Set Tags

### Setting Tags
For those of you who want to set tags for questions, open `questions.json` and find a question that does not have tags, or you think has insufficient tags.<br>
It will look something like this:
```
{
    "id": "WACE2023Q1",
    "name": "WACE 2023 Calc Free Question 1",
    "year": 2023,
    "source": "WACE",
    "calculator": "free",
    "tags": []
},
```
This is the first question of the WACE 2023 Calculator Free exam.<br>
Open the exam or marking key and see what topics the question assesses and determine what tags should be added.<br>
A list of tags can be found in `tagsV2.json` and if the subject is not there, try looking in `tags.json`. Both the tag group names and subtags can be used as tags.<br>
Add the tags to the tags array as strings, capitals do matter.<br>
Just do what you think is correct, and don't be afraid to create new tags if necessary.<br>

If I want to add the tag 'Tag1' for example, the question would look something like this:
```
{
    "id": "WACE2023Q1",
    "name": "WACE 2023 Calc Free Question 1",
    "year": 2023,
    "source": "WACE",
    "calculator": "free",
    "tags": ["Tag1"]
}
```
and if I add the tags 'Tag2' and 'Tag3' as well,
```
{
    "id": "WACE2023Q1",
    "name": "WACE 2023 Calc Free Question 1",
    "year": 2023,
    "source": "WACE",
    "calculator": "free",
    "tags": ["Tag1", "Tag2", "Tag3"]
}
```

### Creating Tags
In order to create tags, first open `tagsV2.json`. Go to the corresponding subject and add the tag to the correct category or create a new category. <br>
For example, I want to add the tag 'Tag1' under the functions tag group and I want to create a tag group called 'Tag2' with 'Tag3' and 'Tag4' under it. The new spec tags woudl look like this:
```
"spec": {
    "Calculus": [
        "Integration", 
    ],
    "Functions": [
        "Polynomials",
        "Inverse Functions",
        "Tag1"
    ],
    "Tag2": [
        "Tag3",
        "Tag4"
    ]
}
```
In order to create a tag that is not in a group, create an empty tag group. In this example, 'Tag5' is an empty tag group that would appear as a tag that is not grouped.
```
"spec": {
    "Calculus": [
        "Integration", 
    ],
    "Functions": [
        "Polynomials",
        "Inverse Functions",
        "Tag1"
    ],
    "Tag2": [
        "Tag3",
        "Tag4"
    ],
    "Tag5": []
}
```
Note: The names of tag groups are also tags themselves. So in the previous example, 'Calculus', 'Functions', 'Tag2' and 'Tag5' are all tags that can be selected and searched for.

## A Guide to Processing Questions

### Step 1: Download Python Libraries
It is strongly recommended to install python and the required libraries from `requirements.txt`. <br>
Otherwise, you will have to manually photoshop the images which is rather time consuming. <br>
For those who don't want to use python, just manually do what is described in the steps (may take several hours per exam).

### Step 2: Get Questions
Open the past paper pdf that you found online and screenshot the individual questions. <br>
This process is currently not automated due to a variety of factors but we are working on a solution. <br>
Each question image should not have any borders so the resizing program does not break. Also crop out any headders and footers, like the page number. Keep the number of marks as that is rather important.<br>
Multiple question parts can be put in the same image, this is fine. Only use multiple images if the questions spans several pages.<br>
If a question requires multiple images as it spans muliple pages, crop out any repeated question numbers like 'Question 1 (continued)'.<br>
Make sure to save all the images with the same name as the question id so 2023 WACE question 1 would be named WACE2023Q1.png<br>
Questions that require multiple images are handled differently. The images would be named WACE2023Q1.1.png, WACE2023Q1.2.png, WACE2023Q1.3.png and so on.<br>
Make sure to only get the questions and NOT the marking keys as well. All images should be .png<br>
<br>
If you don't want to manually name the questions, just make sure you screenshot the parts of each question in order (part 1 before part 2 and so on). Then run `renamer.py` and it will automatically name the questions correctly. You will have to adjust the template to make sure the info is correct, but thats just changing the year and maybe source so its pretty simple.<br>
<br>
`screenshotter.py` is avalaible to make screenshotting easier by simplifying the keybind. Just input the keybind for screenshotting and run the program (maybe with sudo if it needs perms). Its a minor time save, but stops your hand from getting as tired so it is quite useful. THis program is not necessary though so don't worry if you can't get it working.

### Step 3: Process Images
Once you have all the questions in the image processing folder, run `processor.py`. This will automatically crop all the images, as long as the background is completely white and turn the images into .webp format.<br>
If you are uncretain of how well you cropped the images, you cn check the outputed images for any problems.<br>
Note that this step will delete the .png images inputed.

### Step 4: Make PDFs
Run `pdfMaker.py` and it will create the PDF dowloads for all the questions. For questions with multiple images, each image is on a separate page to leave sufficient room for working out.<br>
This will create PDFs without altering the source .webp images

### Step 5: Make Questions
Run `stacker.py` to turn the questions with multiple images into a single image. This process will automatically rename the question to the correct format (as long as the input format is correct) and will also delete the input images. This step will not affect the images that don't need to be stacked.

### Step 6: Handle Outputs
Move the PDFs to the pdfDownloads folder and put them in the correct subject folder. Images go into the questionBank folder under the correct subject folder. 

### Step 7: Make Marking Keys
Repeat step 2 but for the marking keys. Use the same naming format. Each marking key and question should have the same name but are in different folders so they do not conflict.

### Step 8: Process Marking Keys
Only need to run `processor.py` and `stacker.py` on the marking keys. THe output images can then be moved to the markingKeys folder under the correct subject folder. 

### Step 9: Add Question Data
Open `dataSynthesiser.py` and edit the template variable until the question data is correct. Then set start question and end question and run the program. The question data will be outputed to the terminal and can be copy pasted into `questions.json`. <br>
If you want to set tags, add the tags to the tags array for each question. Its fine if you don't want to do tags, somebody else will have to do them.

### Step 10: Upload
If you are a contributor, just commit changes and push to main. Otherwise, create a pull request and wait for a contributor to accept.
