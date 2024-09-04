import subprocess
import sys
import os

# Find shit
python_cmd = sys.executable
script_dir = os.path.dirname(os.path.abspath(__file__))

print("QUESTION PROCESSING: Running image renamer")
subprocess.run([python_cmd, os.path.join(script_dir, 'renamer.py')], check=True)
print("QUESTION PROCESSING: Finished running image renamer")

print("QUESTION PROCESSING: Running image processor")
subprocess.run([python_cmd, os.path.join(script_dir, 'processor.py')], check=True)
print("QUESTION PROCESSING: Finished running image processor")

print("QUESTION PROCESSING: Running PDF maker")
subprocess.run([python_cmd, os.path.join(script_dir, 'pdfMaker.py')], check=True)
print("QUESTION PROCESSING: Finished running PDF maker")

print("QUESTION PROCESSING: Running image stacker")
subprocess.run([python_cmd, os.path.join(script_dir, 'stacker.py')], check=True)
print("QUESTION PROCESSING: Finished running image stacker")