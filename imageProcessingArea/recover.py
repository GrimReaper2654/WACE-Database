import os
import shutil
import json

# In case you fuck up really badly
# Can find and replace in file names or add calculator into question names for math exams in question data
# most other issues in question data can be fixed with built in find and replace
# added function to replace .PNG with .png

extension = 'webp'
find = '2021'
replace = '2020'

def fix_filenames():
    directory = os.path.dirname(os.path.abspath(__file__))
    things = [f for f in os.listdir(directory) if f.endswith(f'.{extension}')]
    for thing in things:
        old_path = os.path.join(directory, thing)
        new_path = os.path.join(directory, thing.replace(find, replace))
        shutil.move(old_path, new_path)
        print(f"Moved {old_path.rsplit('/', 1)[-1]} to {new_path.rsplit('/', 1)[-1]}")

subject = 'meth'
year = '2023'
file_path = 'questions.json'

def find_and_replace_in_json(file_path):
    # Load the JSON file
    with open(file_path, 'r') as file:
        data = json.load(file)

    def replace_questions(questions):
        for question in questions:
            if 'id' in question and year in question['id']:
                if question['calculator'] == 'free':
                    question['name'] = question['name'].replace(year, f'{year} Calc Free').replace('Calc Free Calc Free', 'Calc Free')
                    print(f"Renamed: {question['name']}")
                else:
                    question['name'] = question['name'].replace(year, f'{year} Calc Assumed').replace('Calc Assumed Calc Assumed', 'Calc Assumed')
                    print(f"Renamed: {question['name']}")
                    
    replace_questions(data[subject])

    # Write the modified JSON back to the file
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

def png():
    directory = os.path.dirname(os.path.abspath(__file__))
    things = [f for f in os.listdir(directory) if f.endswith(f'.PNG')]
    for thing in things:
        old_path = os.path.join(directory, thing)
        new_path = os.path.join(directory, thing.replace('.PNG', '.png'))
        shutil.move(old_path, new_path)
        print(f"Moved {old_path.rsplit('/', 1)[-1]} to {new_path.rsplit('/', 1)[-1]}")


fix_filenames()
# find_and_replace_in_json(file_path)
# png()