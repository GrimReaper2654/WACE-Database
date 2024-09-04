import subprocess
import sys
import os

# Find shit
python_cmd = sys.executable
script_dir = os.path.dirname(os.path.abspath(__file__))

print("MARKING KEY PROCESSING: Running image renamer")
subprocess.run([python_cmd, os.path.join(script_dir, 'renamer.py')], check=True)
print("MARKING KEY PROCESSING: Finished running image renamer")

print("MARKING KEY PROCESSING: Running image processor")
subprocess.run([python_cmd, os.path.join(script_dir, 'processor.py')], check=True)
print("MARKING KEY PROCESSING: Finished running image processor")

print("MARKING KEY PROCESSING: Running image stacker")
subprocess.run([python_cmd, os.path.join(script_dir, 'stacker.py')], check=True)
print("MARKING KEY PROCESSING: Finished running image stacker")