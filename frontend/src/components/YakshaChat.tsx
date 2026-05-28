import React, { useState, useRef, useEffect } from 'react';

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

export const YakshaChat: React.FC<YakshaChatProps> = ({ isModal, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm Yaksha-mini, your FAQ assistant for the Vicharanashala Internship. Ask me anything about NOC, offer letters, timings, or the programme.",
      sender: 'bot',
      time: getTime(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      text: inputValue.trim(),
      sender: 'user',
      time: getTime(),
    };

    const userQuery = inputValue.trim();
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        text: `Thanks for your question about <strong>"${userQuery}"</strong>. This is a mock response — the live backend will query the FAQ database or use the LLM fallback (Minimax → Gemini) to generate a real answer.`,
        sender: 'bot',
        time: getTime(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <aside className="yaksha-sidebar">
      <div className="yaksha-sticky">

        {/* Header */}
        <div className="yaksha-header">
          <div className="yaksha-avatar">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="18" fill="rgba(240,192,64,0.15)" />
              <text x="18" y="23" textAnchor="middle" fontSize="16" fill="#f0c040">Y</text>
            </svg>
          </div>
          <div className="yaksha-header-info">
            <div className="yaksha-name">Yaksha-mini</div>
            <div className="yaksha-status">
              <span className="yaksha-dot" />
              FAQ AI Assistant
            </div>
          </div>

          {/* Voice button — always visible */}
          <button className="yaksha-voice-btn" type="button" aria-label="Voice input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          {/* Close button — only rendered inside the modal */}
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

        {/* Messages Area */}
        <div className="yaksha-messages">
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

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form className="yaksha-input-area" onSubmit={handleSend}>
          <input
            type="text"
            className="yaksha-input"
            placeholder="Ask about NOC, offer letter, timing…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoComplete="off"
          />
          <button
            type="submit"
            className="yaksha-send"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>

      </div>
    </aside>
  );
};

export default YakshaChat;
