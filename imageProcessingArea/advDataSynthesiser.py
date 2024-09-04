import os
import re
import glob
import json

# Templates for questions
template = '''{
    "id": "[organisation][year]Q[i]",
    "name": "[organisation] [year] Question [i]",
    "year": [year],
    "source": "[organisation]",
    "calculator": "assumed",
    "tags": []
}'''

templateMath = '''{
    "id": "[organisation][year]Q[i]",
    "name": "[organisation] [year] Calculator [Calc] Question [i]",
    "year": [year],
    "source": "[organisation]",
    "calculator": "[calc]",
    "tags": []
}'''

def generate_json_for_questions():
    # Get the current working directory
    directory = os.path.dirname(os.path.abspath(__file__))
    root = os.getcwd()

    # Read organisation and year from info.txt
    with open(os.path.join(directory, "info.txt"), "r") as file:
        info = file.read().strip()
        organisation = re.findall(r'[A-Za-z]+', info)[0]
        year = re.findall(r'\d+', info)[0]

    # Read subject from subject.txt
    with open(os.path.join(directory, "subject.txt"), "r") as subject_file:
        subject = subject_file.read().strip()

    # Determine the template to use based on calculator.txt
    calc_questions = -1
    calc_exists = os.path.exists(os.path.join(directory, "calculator.txt"))
    if calc_exists:
        with open(os.path.join(directory, "calculator.txt"), "r") as calc_file:
            calc_content = calc_file.read().strip()
            if calc_content.isdigit():
                calc_questions = int(calc_content)

    # Find the highest question number based on the PDF files
    pdf_files = glob.glob(os.path.join(directory, "*.pdf"))
    highest_question = 0
    for pdf in pdf_files:
        question_numbers = re.findall(r'Q(\d+)', pdf)
        if question_numbers:
            max_question_in_pdf = max(int(q) for q in question_numbers)
            highest_question = max(highest_question, max_question_in_pdf)

    # Load existing JSON data from questions.json
    json_file_path = os.path.join(root, "questions.json")
    if os.path.exists(json_file_path):
        with open(json_file_path, "r") as json_file:
            questions_data = json.load(json_file)
    else:
        questions_data = {}

    # Initialize the subject array if it doesn't exist
    if subject not in questions_data:
        questions_data[subject] = []

    # Generate the JSON for each question
    for i in range(1, highest_question + 1):
        if calc_questions == -1: # Not Math
            json_data = template.replace("[organisation]", organisation).replace("[year]", year).replace("[i]", str(i))
        else: # Is Math
            if i <= calc_questions:
                json_data = templateMath.replace("[organisation]", organisation).replace("[year]", year).replace("[i]", str(i)).replace("[calc]", "free").replace("[Calc]", "Free")
            else:
                json_data = templateMath.replace("[organisation]", organisation).replace("[year]", year).replace("[i]", str(i)).replace("[calc]", "assumed").replace("[Calc]", "Assumed")

        # Convert the JSON string to a dictionary and add it to the subject list
        questions_data[subject].append(json.loads(json_data))

    # Write the updated JSON data back to questions.json
    with open(json_file_path, "w") as json_file:
        json.dump(questions_data, json_file, indent=4)

# Run the function to generate JSON
generate_json_for_questions()
