'use client';
import { useState, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. File Upload
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

  // 2. Camera On
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera i phal lo nge? Settings ah en rawh");
      setShowCamera(false);
    }
  };

  // 3. Thla la
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

  // 4. Camera Off
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

    try {
      // THLALAK SIAM DUH EM? check phawt ang
      const isImageGen = userMessage.toLowerCase().includes("siam rawh") || userMessage.toLowerCase().includes("draw") || userMessage.toLowerCase().includes("thlalak min") || userMessage.toLowerCase().includes("pe rawh");

      let response;
      if (isImageGen &&!image) {
        // Image siamna API ko rawh
        response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage })
        });
        const data = await response.json();
        if (data.image) {
          setMessages(prev => [...prev, { role: 'bot', content: 'Awle, hei i thlalak tur:', image: data.image }]);
        } else {
          setMessages(prev => [...prev, { role: 'bot', content: data.error || 'Thlalak ka siam thei lo' }]);
        }
      } else {
        // Chat pangngai + Vision + Memory
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
        setMessages(prev => [...prev, { role: 'bot', content: data.reply || data.error }]);
      }

      setImage(null);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Network a buai, vawi khat han try leh teh' }]);
    }

    setLoading(false);
  };

  return (
    <main style={{ background: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', marginBottom: '20px' }}>ZOGPT</h1>

      <div style={{ maxWidth: '600px', margin: '0 auto', height: '60vh', overflowY: 'auto', padding: '10px', marginBottom: '20px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '50px' }}>
            ZOGPT ka ni e. Thu min zawt la, thlalak pawh min thawn rawh. "Thlalak siam rawh" ti la ka siam sak ang che.
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
          </div>
        ))}
        {loading && <div style={{ background: '#374151', padding: '10px 15px', borderRadius: '10px', width: 'fit-content' }}>Ngaihtuah mek...</div>}
      </div>

      {/* Camera UI */}
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
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="ZOGPT hnenah engkim zawt rawh..."
          disabled={loading}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#1f2937', color: 'white' }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{ padding: '12px 20px', borderRadius: '8px', border: 'none', background: loading? '#4b5563' : '#2563eb', color: 'white', cursor: loading? 'not-allowed' : 'pointer' }}
        >
          Send
        </button>
      </div>
      {image &&!showCamera && <div style={{textAlign: 'center', color: '#fbbf24', fontSize: '12px', marginTop: '5px'}}>Thlalak thlan fel. Send hmet rawh.</div>}
    </main>
  );
}
