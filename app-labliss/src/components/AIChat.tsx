import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you order. Ask me about our menu or for recommendations!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { items, fulfillment } = useCart();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const result = await api.askAI(userMsg, items, fulfillment);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble processing that. Please try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          isOpen ? 'bg-gray-800 text-white' : 'bg-[#E85D2B] text-white'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#FFF0EB] border-b border-gray-100 px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#E85D2B] rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Ordering Assistant</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-100' : 'bg-[#E85D2B]/10'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-gray-600" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-[#E85D2B]" />
                    )}
                  </div>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#E85D2B] text-white rounded-br-sm'
                      : 'bg-[#F5F5F3] text-gray-800 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#E85D2B]/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-[#E85D2B]" />
                  </div>
                  <div className="bg-[#F5F5F3] rounded-xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about our menu..."
                  className="flex-1 h-10 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[#E85D2B] focus:ring-2 focus:ring-[#E85D2B]/10 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-[#E85D2B] text-white rounded-full flex items-center justify-center hover:bg-[#D14E1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
