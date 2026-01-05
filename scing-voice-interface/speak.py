import pyttsx3


engine = pyttsx3.init()
engine.setProperty("rate", 185)
engine.setProperty("volume", 0.9)


def speak(text: str) -> None:
	print("[Speaking]:", text)
	engine.say(text)
	engine.runAndWait()


if __name__ == "__main__":
	speak("Scing voice initialized.")
