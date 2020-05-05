import os
import time
import atexit
import urllib.request

# Firestore emulator instance
run_firestore = None


# Exit handler to stop the emulator
def exit_handler():
    if run_firestore:
        run_firestore.close()
        print("Firestore emulator stopped.")
    print("Exiting the script.")


# Function for checking if emulator started or not
def emulator_started(port="8001"):
    try:
        if urllib.request.urlopen("http://localhost:{}".format(port)).status == 200:
            return True
        else:
            return False
    except Exception as e:
        print(e)
        return False


# register the Exit handler
atexit.register(exit_handler)

# Ask user if they want to run a web app or tests
test = input("Would you like to run tests? (yes/no; default is no): ")

# Prepare the correct port number and the main command based on the user's input
if test == "yes":
    print("Preparing to run tests.")
    emulator_port = "8002"
    text_bottom = "tests"
    os.environ["TESTING"] = "yes"
    main_command = "pytest -p no:warnings"
else:
    print("Preparing to run the web app.")
    emulator_port = "8001"
    text_bottom = "web app"
    os.environ["FLASK_APP"] = "main.py"
    main_command = "flask run --host localhost --port 8080 --reload"

# Run firestore emulator
emulator_command = 'gcloud beta emulators firestore start --project test --host-port "localhost:{}"'.format(emulator_port)
run_firestore = os.popen(emulator_command)

# wait for the Emulator to start
print("Checking if emulator has started yet...")
while not emulator_started(port=emulator_port):
    print("Emulator hasn't started yet. Let's wait 5 seconds and check again. (It may take a while, so please be patient.)")
    time.sleep(10)

print("Yaaay, the emulator is on! Now we can start our {}.".format(text_bottom))

# Run the main command, which is either the web app, or pytest
run_main_command = os.popen(main_command)

# Print process output in the Terminal
print(run_main_command.read())