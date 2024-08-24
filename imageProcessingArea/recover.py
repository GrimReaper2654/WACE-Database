import os
import shutil

# In case you fuck up really badly

extension = 'webp'
find = '2022'
replace = '2021'

directory = os.path.dirname(os.path.abspath(__file__))
things = [f for f in os.listdir(directory) if f.endswith(f'.{extension}')]
for thing in things:
        old_path = os.path.join(directory, thing)
        new_path = os.path.join(directory, thing.replace(find, replace))
        shutil.move(old_path, new_path)
        print(f"Moved {old_path.rsplit('/', 1)[-1]} to {new_path.rsplit('/', 1)[-1]}")