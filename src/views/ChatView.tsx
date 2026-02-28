
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

const QUICK_QUESTIONS = [
  '🌿 Qual o melhor hidrante natural?',
  '💧 Como fazer crescer mais rápido?',
  '✂️ Como evitar pontas duplas?',
  '🍳 Clara de ovo funciona para reconstrução?',
  '🥥 Como usar óleo de coco no cabelo?',
];

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content:
        'Olá, rainha! 🌿 Sou a Lia, sua Mentora Natural de Beleza Capilar.\n\nEstou aqui para te guiar com tratamentos 100% naturais, receitas caseiras e rituais personalizados para seus fios. O que você precisa hoje?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatWithAssistant(text, messages);
      const modelMsg: ChatMessage = {
        role: 'model',
        content: response || '',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'Desculpe, tive uma dificuldade agora. Pode repetir sua pergunta? 💚',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="flex flex-col pt-4 pb-28"
      style={{ height: 'calc(100dvh - 120px)' }}
    >
      {/* Header */}
      <header className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'var(--color-surface-brand)' }}
          >
            🌿
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none" style={{ color: 'var(--color-text-primary)' }}>
              Lia — Mentora Natural
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Especialista em beleza capilar orgânica
            </p>
          </div>
          <div
            className="ml-auto px-2 py-1 rounded-full text-[10px] font-bold"
            style={{ background: 'var(--color-status-success-bg)', color: 'var(--color-status-success-text)' }}
          >
            ● Online
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar"
        style={{ minHeight: 0 }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mr-2 mt-1"
                  style={{ background: 'var(--color-surface-brand)' }}
                >
                  🌿
                </div>
              )}
              <div
                className="max-w-[78%] px-4 py-3 text-sm leading-relaxed rounded-2xl"
                style={
                  msg.role === 'user'
                    ? {
                      background: 'var(--gradient-nature)',
                      color: 'white',
                      borderBottomRightRadius: 4,
                      boxShadow: 'var(--shadow-card)',
                    }
                    : {
                      background: 'var(--color-surface-card)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border-subtle)',
                      borderBottomLeftRadius: 4,
                      whiteSpace: 'pre-wrap',
                      boxShadow: 'var(--shadow-card)',
                    }
                }
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'var(--color-surface-brand)' }}
            >
              🌿
            </div>
            <div
              className="px-4 py-3 rounded-2xl flex gap-1 items-center"
              style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border-subtle)' }}
            >
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--color-text-muted)' }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Sugestões rápidas */}
      {messages.length <= 1 && (
        <div className="pt-3 pb-1">
          <p className="text-label mb-2">Pergunte sobre:</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium border transition-all"
                style={{
                  background: 'var(--color-surface-card)',
                  borderColor: 'var(--color-border-default)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div
        className="pt-3 flex items-center gap-2"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <button
          className="p-3 rounded-2xl transition-all duration-150 border border-border-default hover:bg-surface-subtle"
          style={{ color: 'var(--color-text-muted)' }}
          title="Anexar foto para análise"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Pergunte à Mentora Natural..."
          className="flex-1 px-4 py-3 rounded-2xl text-sm focus:outline-none"
          style={{
            background: 'var(--color-surface-card)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-primary)',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isTyping || !input.trim()}
          className="p-3 rounded-2xl transition-all duration-150 disabled:opacity-40"
          style={{ background: 'var(--color-action-primary)', color: 'white' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatView;
