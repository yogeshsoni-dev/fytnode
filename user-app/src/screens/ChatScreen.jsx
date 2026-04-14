import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { chatApi } from '../api/chat.api';

const WELCOME_MSG = {
  id: 'welcome',
  role: 'ai',
  text: "Hi! I'm your FytNodes health coach. Ask me anything about nutrition, workouts, recovery, or your fitness goals. I'm here to help!",
  ts: Date.now(),
};

const QUICK_PROMPTS = [
  'What should I eat after a workout?',
  'How many calories should I consume daily?',
  'Give me a beginner workout plan.',
  "How do I improve my sleep for recovery?",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [error, setError]       = useState('');

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = text.trim();
    if (!msg || sending) return;

    const userMsg = { id: Date.now(), role: 'user', text: msg, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setError('');

    try {
      const res = await chatApi.sendMessage(msg);
      const reply = res?.response ?? res?.message ?? res?.reply ?? JSON.stringify(res);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: reply, ts: Date.now() },
      ]);
    } catch (e) {
      setError('Failed to get a response. Please try again.');
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const handleQuick = (prompt) => {
    send(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'ai'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              {msg.role === 'ai' ? (
                <Bot className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'ai'
                  ? 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs text-center py-1">{error}</p>
      )}

      {/* Quick prompts (show only when no user messages sent yet) */}
      {messages.length === 1 && !sending && (
        <div className="flex flex-wrap gap-2 py-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleQuick(p)}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full px-3 py-1.5 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 pt-2 border-t border-gray-100"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your health coach…"
          disabled={sending}
          className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
