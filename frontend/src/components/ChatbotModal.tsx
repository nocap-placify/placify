import React, { useEffect, useState, useRef } from 'react';

interface ChatbotModalProps {
  srn: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ srn }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://100.102.21.101:8081/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srn, message: newMessage.content }),
      });

      const data = await response.json();

      if (data?.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'No response received.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: '❌ Error connecting to chatbot.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div
    className="flex flex-col w-full h-full max-h-[90vh] p-5 rounded-2xl backdrop-blur-xl border border-white/10 overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(109,40,217,0.04))',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}
  >
  
      <div className="text-xl font-semibold text-blue-300 mb-3">
        🤖 Recruiter Assistant
      </div>

      <div className="flex-1 overflow-y-auto border border-white/10 rounded-lg p-4 bg-white/5 backdrop-blur-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-2xl max-w-[75%] ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/20 text-white border border-white/10 backdrop-blur-md shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left text-gray-300 italic">Recruiter Assistant is thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-4 py-2 rounded-full bg-white/10 text-white placeholder-white/60 border border-white/20 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask something about the candidate..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 shadow-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotModal;
