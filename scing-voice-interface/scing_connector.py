import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


def send_to_scing(user_input: str) -> str:
	api_key = os.getenv("OPENAI_API_KEY")
	if not api_key:
		return "Missing OPENAI_API_KEY. Create a local .env (not committed) or set it in your environment."

	requested_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
	fallback_model = "gpt-4o-mini"
	if os.getenv("SCING_DEBUG") == "1":
		print("MODEL:", requested_model)
	client = OpenAI(api_key=api_key)

	system_prompt = (
		"You are Scing, an assistant designed to help the user with care, clarity, and humility. "
		"Never coerce or manipulate. Ask clarifying questions when unsure."
	)

	def _call(model: str) -> str:
		response = client.chat.completions.create(
			model=model,
			messages=[
				{"role": "system", "content": system_prompt},
				{"role": "user", "content": user_input},
			],
			temperature=0.7,
		)
		return (response.choices[0].message.content or "").strip()

	try:
		return _call(requested_model)
	except Exception as exc:
		message = str(exc)
		status_code = getattr(exc, "status_code", None)
		code = getattr(exc, "code", None)
		is_quota = (
			(status_code == 429)
			or (code == "insufficient_quota")
			or ("insufficient_quota" in message)
		)

		if is_quota and requested_model != fallback_model:
			print(f"[Scing fallback] Switching to {fallback_model} due to quota.")
			try:
				return _call(fallback_model)
			except Exception as exc2:
				print("[Scing error]", exc2)
				return "I'm having trouble connecting to the Scing Source."

		print("[Scing error]", exc)
		return "I'm having trouble connecting to the Scing Source."


if __name__ == "__main__":
	print(send_to_scing("What are you?"))
