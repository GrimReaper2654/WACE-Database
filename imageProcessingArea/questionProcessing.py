import subprocess
import sys
import os

# Find shit
python_cmd = sys.executable
script_dir = os.path.dirname(os.path.abspath(__file__))

print("Running Renamer")
subprocess.run([python_cmd, os.path.join(script_dir, 'renamer.py')], check=True)
print("Finished running Renamer")

print("Running Processor")
subprocess.run([python_cmd, os.path.join(script_dir, 'processor.py')], check=True)
print("Finished running Processor")

print("Running PDF maker")
subprocess.run([python_cmd, os.path.join(script_dir, 'pdfMaker.py')], check=True)
print("Finished running PDF maker")

print("Running Stacker")
subprocess.run([python_cmd, os.path.join(script_dir, 'stacker.py')], check=True)
print("Finished running Stacker")