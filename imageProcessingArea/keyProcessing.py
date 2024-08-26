import subprocess
import sys
import os
import simpleaudio as sa

# Find shit
python_cmd = sys.executable
script_dir = os.path.dirname(os.path.abspath(__file__))

print("Running Renamer")
subprocess.run([python_cmd, os.path.join(script_dir, 'renamer.py')], check=True)
print("Finished running Renamer")

print("Running Processor")
subprocess.run([python_cmd, os.path.join(script_dir, 'processor.py')], check=True)
print("Finished running Processor")

print("Running Stacker")
subprocess.run([python_cmd, os.path.join(script_dir, 'stacker.py')], check=True)
print("Finished running Stacker")

# remind the user processing has finished
print('Processing Complete')
wave_obj = sa.WaveObject.from_wave_file(os.path.join(script_dir, 'audio.wav'))
play_obj = wave_obj.play()
play_obj.wait_done()