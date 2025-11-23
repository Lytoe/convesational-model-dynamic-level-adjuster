export function startSpeechRecognition(onResult: (text: string) => void, lang = 'fr-FR') {
  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.onresult = (e: any) => {
    const transcript = e.results[0][0].transcript;
    onResult(transcript);
  };
  recognition.start();
  return recognition;
}
