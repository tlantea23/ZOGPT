'use client';
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);

  const sendMessage = async () => {
    if (!input) return;
    const newMessages = [...messages, {role: 'user', content: input}];
    setMessages(newMessages);
    setInput('');
    
    // API call kan la dah ang
    setTimeout(() => {
      setMessages([...newMessages, {role: 'assistant', content: 'ZOGPT test reply: ' + input}]);
    }, 500);
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold my-8">ZOGPT</h1>
      
      <div className="w-full max-w-2xl flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-4 rounded-lg ${m.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-700'} max-w-[80%]`}>
            {m.content}
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600"
          placeholder="ZOGPT hnenah engkim zawt rawh..."
        />
        <button 
          onClick={sendMessage}
          className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </main>
  );
}
