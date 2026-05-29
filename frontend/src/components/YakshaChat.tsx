import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Send, Sparkles, BookOpen, HelpCircle, Award, Clock } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  time: string;
}

interface YakshaChatProps {
  isModal: boolean;
  onClose: () => void;
}

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const INITIAL_MESSAGE: Message = {
  text: "Hello! I'm <strong>Yaksha</strong>, your AI mentor for the Vicharanashala Internship. I can help you with NOC queries, offer letters, programme details, coursework doubts, and technical guidance. How can I help you today?",
  sender: 'bot',
  time: getTime(),
};

const SUGGESTED_PROMPTS = [
  { icon: HelpCircle, text: "What is the NOC process?" },
  { icon: BookOpen, text: "Tell me about Phase 1 coursework" },
  { icon: Award, text: "How do I earn the Gold badge?" },
  { icon: Clock, text: "What are the attendance rules?" },
];

export const YakshaChat: React.FC<YakshaChatProps> = ({ isModal, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent, promptText?: string) => {
    if (e) e.preventDefault();
    const textToSend = promptText || inputValue.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      text: textToSend,
      sender: 'user',
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        text: `Thanks for your question about <strong>"${textToSend}"</strong>. This is a mock response — the live backend will query the FAQ database or use the LLM fallback (Minimax → Gemini) to generate a real answer.`,
        sender: 'bot',
        time: getTime(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botResponse]);
    }, 1200);
  };

  const handleClearChat = () => {
    setMessages([{ ...INITIAL_MESSAGE, time: getTime() }]);
  };

  return (
    <aside className={`yaksha-sidebar ${!isModal ? 'yaksha-dashboard' : ''}`}>
      <div className="yaksha-sticky" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Header ── */}
        <div className="yaksha-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--accent-glow-strong)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 700,
            }}>
              Y
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Yaksha <Sparkles size={14} color="var(--accent)" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />
                AI Mentor · Doubt Resolver
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleClearChat}
              title="Clear Chat"
              style={{
                padding: '8px', border: 'none', borderRadius: '8px',
                background: 'var(--bg-card)', color: 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Trash2 size={16} />
            </button>
            {isModal && (
              <button
                className="yaksha-modal-close-btn"
                onClick={onClose}
                aria-label="Close chat"
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="yaksha-messages" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`yaksha-msg yaksha-msg--${msg.sender}`}
            >
              {msg.sender === 'bot' && (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: 'var(--accent-glow)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                }}>
                  Y
                </div>
              )}
              <div>
                <div
                  className="yaksha-bubble"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                <div className="yaksha-time">{msg.time}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="yaksha-msg yaksha-msg--bot yaksha-typing">
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                background: 'var(--accent-glow)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700,
              }}>
                Y
              </div>
              <div className="yaksha-bubble">
                <div className="yaksha-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Prompts */}
          {messages.length === 1 && !isTyping && (
            <div style={{ padding: '8px 0 16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Suggested Questions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="yaksha-prompt-chip"
                    onClick={() => handleSend(undefined, prompt.text)}
                  >
                    <prompt.icon size={14} style={{ marginRight: '6px', opacity: 0.7 }} />
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <form className="yaksha-input-area" onSubmit={(e) => handleSend(e)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="text"
            className="yaksha-input"
            placeholder="Ask about NOC, coursework, badges…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '15px', fontFamily: 'var(--font)' }}
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!inputValue.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '50%',
              background: inputValue.trim() ? 'var(--accent)' : 'transparent',
              color: inputValue.trim() ? '#000' : 'var(--text-muted)',
              border: inputValue.trim() ? 'none' : '1px solid var(--border)',
              cursor: inputValue.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </aside>
  );
};

export default YakshaChat;
