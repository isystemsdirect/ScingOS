import queue
import sys
from typing import Optional

import numpy as np
import sounddevice as sd

try:
	import whisper
except Exception as exc:  # pragma: no cover
	whisper = None
	_whisper_import_error = exc


q: "queue.Queue[np.ndarray]" = queue.Queue()
samplerate = 16000
duration = 5  # seconds


def callback(indata: np.ndarray, frames: int, time, status) -> None:
	if status:
		print(status, file=sys.stderr)
	q.put(indata.copy())


def record_audio(seconds: int = duration, sample_rate: int = samplerate) -> np.ndarray:
	blocksize = 1024
	num_blocks = int(np.ceil((sample_rate * seconds) / blocksize))

	with sd.InputStream(
		samplerate=sample_rate,
		channels=1,
		dtype="float32",
		blocksize=blocksize,
		callback=callback,
	):
		print("Listening...")
		chunks = [q.get() for _ in range(num_blocks)]

	audio = np.concatenate(chunks, axis=0).astype(np.float32)
	return audio.reshape(-1)


_model = None


def _get_model(model_name: str = "base"):
	global _model
	if _model is None:
		if whisper is None:  # pragma: no cover
			raise RuntimeError(
				"Whisper is not installed. Install dependencies from requirements.txt. "
				f"Import error: {_whisper_import_error}"
			)
		_model = whisper.load_model(model_name)
	return _model


def transcribe(model_name: str = "base") -> str:
	audio = record_audio()
	model = _get_model(model_name)
	result = model.transcribe(audio, fp16=False)
	text: str = (result or {}).get("text") or ""
	print("You said:", text)
	return text


if __name__ == "__main__":
	transcribe()
