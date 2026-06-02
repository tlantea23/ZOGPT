'use client';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window!== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('I browser hian Voice a support lo. Chrome hmang rawh');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result.split(',')[1]);
        setShowCamera(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera i phal lo nge?");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImage(dataUrl.split(',')[1]);
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const sendMessage = async () => {
    if ((!input.trim() &&!image) || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage || "He thlalak hi enge?", hasImage:!!image }]);
    setInput('');
    setLoading(true);
    stopCamera();
    stopSpeaking();

    try {
      const isImageGen = userMessage.toLowerCase().includes("siam rawh") ||
                         userMessage.toLowerCase().includes("draw") ||
                         userMessage.toLowerCase().includes("thlalak min") ||
                         userMessage.toLowerCase().includes("pe rawh") ||
                         userMessage.toLowerCase().includes("han siam") ||
                         userMessage.toLowerCase().includes("siam teh");

      let response;
      let botReply = '';

      if (isImageGen &&!image) {
        response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage })
        });
        const data = await response.json();
        if (data.image) {
          botReply = 'Awle, hei i thlalak tur:';
          setMessages(prev => [...prev, { role: 'bot', content: botReply, image: data.image }]);
          speak(botReply);
        } else {
          botReply = data.error || 'Thlalak ka siam thei lo';
          setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
          speak(botReply);
        }
      } else {
        const chatHistory = messages.map(msg => ({
          role: msg.role === 'bot'? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            image: image,
            history: chatHistory
          })
        });
        const data = await response.json();
        botReply = data.reply || data.error;
        setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
        speak(botReply);
      }

      setImage(null);

    } catch (error) {
      const errorMsg = 'Network a buai, vawi khat han try leh teh';
      setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
      speak(errorMsg);
    }

    setLoading(false);
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
       .mic-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #1f2937;
          color: white;
        }
       .mic-btn:hover {
          background: #374151;
        }
       .mic-btn.listening {
          background: #ef4444;
          animation: pulse 1.5s infinite;
        }
       .mic-icon {
          width: 20px;
          height: 20px;
        }
      `}</style>

      <main style={{ background: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', color: '#fbbf24', marginBottom: '20px' }}>ZOGPT</h1>

        <div style={{ maxWidth: '600px', margin: '0 auto', height: '60vh', overflowY: 'auto', padding: '10px', marginBottom: '20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '50px' }}>
              ZOGPT ka ni e. Mic hmet la, min be rawh.
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              background: msg.role === 'user'? '#2563eb' : '#374151',
              padding: '10px 15px',
              borderRadius: '10px',
              margin: msg.role === 'user'? '10px 0 10px auto' : '10px auto 10px 0',
              width: 'fit-content',
              maxWidth: '80%',
              wordWrap: 'break-word'
            }}>
              {msg.hasImage && <div style={{fontSize: '12px', opacity: 0.7}}>📷 Thlalak nen</div>}
              {msg.content}
              {msg.image && <img src={msg.image} alt="ZOGPT siam" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />}
              {msg.role === 'bot' && (
                <button onClick={() => speak(msg.content)} style={{fontSize: '12px', marginTop: '5px', background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer'}}>
                  🔊 Play leh
                </button>
              )}
            </div>
          ))}
          {loading && <div style={{ background: '#374151', padding: '10px 15px', borderRadius: '10px', width: 'fit-content' }}>Ngaihtuah mek...</div>}
        </div>

        {showCamera && (
          <div style={{ maxWidth: '600px', margin: '0 auto 10px', textAlign: 'center' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '10px' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={capturePhoto} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}>Thla La</button>
              <button onClick={stopCamera} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#4b5563', color: 'white', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ padding: '12px', borderRadius: '8px', background: '#1f2937', cursor: 'pointer' }}>
            📁
            <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          </label>
          <button onClick={startCamera} style={{ padding: '12px', borderRadius: '8px', border: 'none', background: '#1f2937', color: 'white', cursor: 'pointer' }}>
            📷
          </button>

          {/* CHATGPT STYLE MIC BUTTON */}
          <button onClick={toggleListening} className={`mic-btn ${isListening? 'listening' : ''}`}>
            <svg className="mic-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0.55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
            </svg>
          </button>

          {isSpeaking && (
            <button onClick={stopSpeaking} style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer' }}>
              🔇
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isListening? "Ngai thla mek..." : "ZOGPT hnenah engkim zawt rawh..."}
            disabled={loading}
            style={{ flex: 1, padding: '12px', borderRadius: '24px', border: 'none', background: '#1f2937', color: 'white' }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: loading? '#4b5563' : '#2563eb', color: 'white', cursor: loading? 'not-allowed' : 'pointer' }}
          >
            ↑
          </button>
        </div>
        {image &&!showCamera && <div style={{textAlign: 'center', color: '#fbbf24', fontSize: '12px', marginTop: '5px'}}>Thlalak thlan fel. Send hmet rawh.</div>}
      </main>
    </>
  );
}
