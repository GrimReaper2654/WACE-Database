import pyautogui
import keyboard

'''
This screenshot progam works on Mac only. You will need to change the keybind if you are using a different OS.
This program needs to control your computer to screenshot so it may need more perms. Sudo should work.
run in terminal at the image processing folder: sudo python3 screenshotter.py 
'''

def press_screenshot_keybind():
    # Simulate pressing Command + Shift + 5
    pyautogui.hotkey('command', 'shift', '5')

def on_c_key():
    press_screenshot_keybind()

# Bind the 'c' key to trigger the screenshot keybind
keyboard.add_hotkey('c', on_c_key)

print("Press 'c' to trigger the screenshot keybind (Command + Shift + 5).")
print("Press 'x' to exit the program.")

# Keep the script running
keyboard.wait('x')

