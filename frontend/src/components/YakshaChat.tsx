import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Send, Mic, Sparkles } from 'lucide-react';

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
  text: "Hi! I'm Yaksha-mini, your FAQ assistant for the Vicharanashala Internship. Ask me anything about NOC, offer letters, timings, or the programme.",
  sender: 'bot',
  time: getTime(),
};

const SUGGESTED_PROMPTS = [
  "What is the NOC process?",
  "Tell me about the Phase 1 coursework",
  "How are teams formed?",
  "Will I get a certificate?"
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
    }, 1000);
  };

  const handleClearChat = () => {
    setMessages([{ ...INITIAL_MESSAGE, time: getTime() }]);
  };

  return (
    <aside className={`yaksha-sidebar ${!isModal ? 'yaksha-dashboard' : ''}`}>
      <div className="yaksha-sticky" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header */}
        <div className="yaksha-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="yaksha-avatar">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="18" fill="rgba(240,192,64,0.15)" />
                <text x="18" y="23" textAnchor="middle" fontSize="16" fill="#f0c040">Y</text>
              </svg>
            </div>
            <div className="yaksha-header-info">
              <div className="yaksha-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Yaksha-mini <Sparkles size={14} color="var(--accent)" />
              </div>
              <div className="yaksha-status">
                <span className="yaksha-dot" />
                FAQ AI Assistant
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="control-btn" 
              onClick={handleClearChat} 
              title="Clear Chat"
              style={{ padding: '6px', border: 'none' }}
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

        {/* Messages Area */}
        <div className="yaksha-messages" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`yaksha-msg yaksha-msg--${msg.sender}`}
            >
              <div
                className="yaksha-bubble"
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
              <div className="yaksha-time">{msg.time}</div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="yaksha-msg yaksha-msg--bot yaksha-typing">
              <div className="yaksha-bubble">
                <div className="yaksha-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Prompts */}
          {messages.length === 1 && !isTyping && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px' }}>
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(undefined, prompt)}
                  style={{
                    background: 'rgba(240, 192, 64, 0.1)',
                    border: '1px solid rgba(240, 192, 64, 0.2)',
                    color: 'var(--accent)',
                    padding: '8px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(240, 192, 64, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(240, 192, 64, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form className="yaksha-input-area" onSubmit={(e) => handleSend(e)}>
          <button className="yaksha-voice-btn" type="button" aria-label="Voice input" style={{ color: 'var(--text-muted)' }}>
            <Mic size={18} />
          </button>
          <input
            type="text"
            className="yaksha-input"
            placeholder="Ask about NOC, offer letter, timing…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button
            type="submit"
            className="yaksha-send"
            aria-label="Send message"
            disabled={!inputValue.trim()}
            style={{ 
              opacity: inputValue.trim() ? 1 : 0.5, 
              cursor: inputValue.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: inputValue.trim() ? 'var(--accent)' : 'transparent',
              color: inputValue.trim() ? 'var(--bg-primary)' : 'var(--accent)',
              border: inputValue.trim() ? 'none' : '1px solid var(--accent)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              transition: 'all 0.2s'
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
