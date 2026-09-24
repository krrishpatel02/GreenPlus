import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaStop, FaVolumeUp } from "react-icons/fa";

const getRecognition = () => {
  if (typeof window === "undefined") return null;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;
  const recognition = new Recognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-IN";
  return recognition;
};

const VoiceAssistant = ({ onTranscript, replyText = "", disabled = false }) => {
  const recognitionRef = useRef(null);
  const transcriptHandlerRef = useRef(onTranscript);
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [error, setError] = useState("");

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const recognition = getRecognition();
    if (!recognition) return undefined;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      setListening(false);
      if (transcript) transcriptHandlerRef.current(transcript);
    };
    recognition.onerror = (event) => {
      setListening(false);
      setError(event.error === "not-allowed" ? "Microphone permission was blocked." : "Voice input was not understood.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;
    setError("");
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    recognitionRef.current.start();
    setListening(true);
  };

  const speakReply = () => {
    if (!replyText || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(replyText);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  if (!supported) {
    return <span className="text-[11px] text-slate-400">Voice input is unavailable in this browser.</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={toggleListening} disabled={disabled} aria-label={listening ? "Stop voice input" : "Start voice input"} title={listening ? "Stop voice input" : "Speak to Leafy"} className={`p-2 rounded-lg border transition ${listening ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600"}`}>
        {listening ? <FaStop /> : <FaMicrophone />}
      </button>
      <button type="button" onClick={speakReply} disabled={!replyText} aria-label="Read Leafy's latest reply aloud" title="Read latest reply aloud" className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-40">
        <FaVolumeUp />
      </button>
      {listening && <span className="text-[11px] font-semibold text-emerald-700">Listening...</span>}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
};

export default VoiceAssistant;
