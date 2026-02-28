"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  originalContent?: string;
  language: string;
  timestamp: number;
}

const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English", flag: "🇺🇸" },
  { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
  { code: "fr-FR", name: "French", flag: "🇫🇷" },
  { code: "zh-CN", name: "Chinese", flag: "🇨🇳" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳" },
  { code: "tl-PH", name: "Tagalog", flag: "🇵🇭" },
  { code: "pa-IN", name: "Punjabi", flag: "🇮🇳" },
];

export default function MultilingualVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessages: Record<string, string> = {
        "en-US": "Hi! I'm your APAS multilingual assistant. You can speak to me in your language, and I'll help you find the right program!",
        "es-ES": "¡Hola! Soy tu asistente multilingüe de APAS. ¡Puedes hablarme en tu idioma y te ayudaré a encontrar el programa correcto!",
        "fr-FR": "Bonjour! Je suis votre assistant multilingue APAS. Vous pouvez me parler dans votre langue et je vous aiderai à trouver le bon programme!",
        "zh-CN": "你好！我是您的APAS多语言助手。您可以用您的语言与我交谈，我会帮助您找到合适的课程！",
        "ar-SA": "مرحبا! أنا مساعدك متعدد اللغات في APAS. يمكنك التحدث معي بلغتك وسأساعدك في العثور على البرنامج المناسب!",
        "hi-IN": "नमस्ते! मैं आपका APAS बहुभाषी सहायक हूं। आप मुझसे अपनी भाषा में बात कर सकते हैं और मैं आपको सही कार्यक्रम खोजने में मदद करूंगा!",
        "tl-PH": "Kumusta! Ako ang iyong APAS multilingual assistant. Maaari kang magsalita sa akin sa iyong wika at tutulungan kita na makahanap ng tamang programa!",
        "pa-IN": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ APAS ਬਹੁਭਾਸ਼ਾਈ ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਮੇਰੇ ਨਾਲ ਗੱਲ ਕਰ ਸਕਦੇ ਹੋ ਅਤੇ ਮੈਂ ਤੁਹਾਨੂੰ ਸਹੀ ਪ੍ਰੋਗਰਾਮ ਲੱਭਣ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ!"
      };

      setMessages([{
        role: "assistant",
        content: welcomeMessages[selectedLanguage] || welcomeMessages["en-US"],
        language: selectedLanguage,
        timestamp: Date.now()
      }]);
    }
  }, [selectedLanguage]);

  // Initialize speech recognition with selected language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setCurrentTranscript(transcript);

          if (event.results[event.results.length - 1].isFinal) {
            handleUserMessage(transcript, selectedLanguage);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setCurrentTranscript("");
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string, language: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Find voice matching the language
      const langCode = language.split('-')[0];
      const matchingVoice = voices.find(v => v.lang.startsWith(langCode));
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = language;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUserMessage = async (text: string, language: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: text,
      language: language,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    setIsProcessing(true);
    
    try {
      // Translate to English if needed
      let englishText = text;
      if (!language.startsWith('en')) {
        const translateResponse = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            targetLanguage: 'en-US'
          })
        });
        const data = await translateResponse.json();
        englishText = data.translatedText || text;
      }

      // Generate response in English
      const englishResponse = generateResponse(englishText);
      
      // Translate response back to user's language
      let responseText = englishResponse;
      if (!language.startsWith('en')) {
        const translateResponse = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: englishResponse,
            targetLanguage: language
          })
        });
        const data = await translateResponse.json();
        responseText = data.translatedText || englishResponse;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: responseText,
        originalContent: englishResponse,
        language: language,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speak(responseText, language);
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to English
      const assistantMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I had trouble with translation. Please try English.",
        language: 'en-US',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
    
    setIsProcessing(false);
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("software") || input.includes("developer") || input.includes("programming")) {
      return "For software development, I recommend SAIT Software Development, NAIT Digital Media and IT, and University of Alberta Computing Science. These programs have excellent job prospects with starting salaries around $65,000-$75,000.";
    }
    
    if (input.includes("engineering") || input.includes("engineer")) {
      return "Alberta has excellent engineering programs! University of Calgary and University of Alberta offer comprehensive engineering degrees. SAIT and NAIT have great engineering technology programs. What type of engineering interests you?";
    }
    
    if (input.includes("business") || input.includes("commerce")) {
      return "For business careers, consider Business Administration at SAIT, Commerce at University of Calgary, or Business Management at NAIT. These programs lead to careers in management, accounting, and HR with good salary prospects.";
    }
    
    if (input.includes("health") || input.includes("nursing") || input.includes("nurse")) {
      return "Healthcare is a growing field in Alberta! Programs like Nursing, Health Care Aide, and Medical Laboratory Technology have excellent employment rates. Starting salaries range from $50,000 to $75,000.";
    }
    
    if (input.includes("cost") || input.includes("tuition") || input.includes("price")) {
      return "Tuition varies by program. Certificates typically cost $5,000-$15,000, Diplomas $15,000-$30,000, and Degrees $25,000-$40,000 total. Many students qualify for financial aid and scholarships.";
    }
    
    if (input.includes("prerequisite") || input.includes("requirement")) {
      return "Most programs require a high school diploma with specific courses. For example, many university programs need English 30-1 and Math 30-1 with at least 60%. Would you like to check if you qualify for a specific program?";
    }
    
    if (input.includes("thank")) {
      return "You're welcome! Feel free to ask me anything else about Alberta programs. I can help in multiple languages!";
    }
    
    return "I can help you explore over 50 programs across Alberta! Ask me about specific careers like software development, engineering, business, or healthcare. I can also help with program costs, prerequisites, and job prospects.";
  };

  const changeLanguage = (langCode: string) => {
    setSelectedLanguage(langCode);
    setShowLanguageMenu(false);
    
    // Restart recognition with new language
    if (recognitionRef.current) {
      recognitionRef.current.lang = langCode;
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all z-50 flex items-center justify-center"
        title="Multilingual Voice Assistant"
      >
        {isOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-2xl">🌍</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <div>
                  <h3 className="font-bold">APAS Voice Assistant</h3>
                  <p className="text-xs opacity-90">Multilingual Support</p>
                </div>
              </div>
              
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-3 py-1 text-sm flex items-center gap-1"
                >
                  <span>{SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl py-2 w-48 z-10">
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 ${
                          selectedLanguage === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 shadow"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Status */}
          {isListening && (
            <div className="bg-red-50 border-t-2 border-red-200 p-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-700 font-semibold">
                  {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag} Listening in {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}...
                </span>
              </div>
              {currentTranscript && (
                <p className="text-sm text-gray-600 mt-1 italic">{currentTranscript}</p>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="border-t-2 border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? "🛑 Stop" : `🎤 Speak ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}`}
              </button>
              
              {isSpeaking && (
                <button
                  onClick={() => window.speechSynthesis.cancel()}
                  className="px-4 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600"
                >
                  🔇
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              {isListening ? `Speaking in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name}...` : "Click to ask about programs"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}