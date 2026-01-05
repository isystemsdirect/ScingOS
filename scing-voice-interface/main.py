from listen import transcribe
from scing_connector import send_to_scing
from speak import speak


def run_loop() -> None:
	print("=== SCINGULAR VOICE INTERFACE ===")
	while True:
		try:
			user_input = transcribe()
			if user_input.strip().lower() in ["exit", "quit"]:
				print("Exiting...")
				break
			response = send_to_scing(user_input)
			speak(response)
		except KeyboardInterrupt:
			print("\nSession interrupted.")
			break


if __name__ == "__main__":
	run_loop()
