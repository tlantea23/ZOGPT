'use client';
import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.reply || data.error }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Network a buai, vawi khat han try leh teh' }]);
    }

    setLoading(false);
  };

  return (
    <main style={{ background: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#fbbf24', marginBottom: '20px' }}>ZOGPT</h1>

      <div style={{ maxWidth: '600px', margin: '0 auto', height: '70vh', overflowY: 'auto', padding: '10px', marginBottom: '20px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '50px' }}>
            ZOGPT ka ni e. Eng nge min zawh duh?
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
            {msg.content}
          </div>
        ))}
        {loading && <div style={{ background: '#374151', padding: '10px 15px', borderRadius: '10px', width: 'fit-content' }}>Ngaihtuah mek...</div>}
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '10px' }}>
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
    </main>
  );
}
