function fallbackSpeak(text: string): void {
  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function speak(text: string): void {
  if (typeof window === "undefined") return;

  const phrase = text.trim();
  if (!phrase) return;

  const encodedText = encodeURIComponent(phrase);
  const youdaoUrl = `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=1`;
  const audio = new Audio(youdaoUrl);

  let didFallback = false;
  const handleFallback = () => {
    if (didFallback) return;
    didFallback = true;
    fallbackSpeak(phrase);
  };

  audio.addEventListener("error", handleFallback, { once: true });
  void audio.play().catch(handleFallback);
}

export function speakRepeated(text: string, repeat = 3, delayMs = 2000): void {
  if (typeof window === "undefined") return;

  const phrase = text.trim();
  if (!phrase) return;

  const times = Math.max(1, repeat);
  for (let i = 0; i < times; i += 1) {
    window.setTimeout(() => {
      speak(phrase);
    }, i * delayMs);
  }
}
