function fallbackSpeak(text: string): void {
  if (!("speechSynthesis" in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function tryPlayUrls(urls: string[], text: string, index = 0): void {
  if (index >= urls.length) {
    fallbackSpeak(text);
    return;
  }

  const audio = new Audio(urls[index]);
  const next = () => tryPlayUrls(urls, text, index + 1);

  audio.addEventListener("error", next, { once: true });
  void audio.play().catch(next);
}

export function speak(text: string): void {
  if (typeof window === "undefined") return;

  const phrase = text.trim();
  if (!phrase) return;

  const encodedText = encodeURIComponent(phrase);

  // Keep legacy-compatible Youdao first, then try Google TTS for phrases
  // that Youdao intermittently fails with (HTTP 500), then local synthesis.
  const sourceUrls = [
    `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=1`,
    `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`,
  ];

  tryPlayUrls(sourceUrls, phrase);
}

export function speakRepeated(text: string, repeat = 3, delayMs = 1500): void {
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
