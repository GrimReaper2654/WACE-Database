import pyautogui
from pynput import keyboard
import time

'''
This screenshot program works on Mac only. You will need to change the keybind if you are using a different OS.
This program needs to control your computer to screenshot so it may need more perms. Sudo should work.
Run in terminal at the image processing folder: sudo python3 screenshotter.py
'''

def press_screenshot_keybind():
    """Simulate pressing Command + Shift + 5 to trigger macOS screenshot tool."""
    pyautogui.hotkey('command', 'shift', '5')

def on_press(key):
    """Handle key presses."""
    try:
        if key.char == 'c':  # If 'c' is pressed, take a screenshot
            press_screenshot_keybind()
        elif key.char == 'x':  # If 'x' is pressed, exit the program
            print("Exiting...")
            return False  # Stops the listener
    except AttributeError:
        pass  # Handle special keys that don’t have a char attribute

def ss():
    """Start listening for keyboard events."""
    print("Press 'c' to trigger the screenshot keybind (Command + Shift + 5).")
    print("Press 'x' to exit the program.")

    with keyboard.Listener(on_press=on_press) as listener:
        listener.join()  # Keeps the script running

def reload():
    """Reloads the page (for reference, not used in this script)."""
    time.sleep(2)
    pyautogui.hotkey('command', 'r')

ss()
