import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Send, Sparkles, BookOpen, HelpCircle, Award, Clock, Mic, CheckCircle2 } from 'lucide-react';

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
  { icon: HelpCircle, text: "What is the NOC process?", category: "Logistics" },
  { icon: BookOpen, text: "Tell me about Phase 1 coursework", category: "Coursework" },
  { icon: Award, text: "How do I earn the Gold badge?", category: "Badges" },
  { icon: Clock, text: "What are the attendance rules?", category: "Policy" },
];

export const YakshaChat: React.FC<YakshaChatProps> = ({ isModal, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const currentText = finalTranscript || interimTranscript;
        setVoiceTranscript(currentText);
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
      }
    };
  }, []);

  const openVoiceModal = () => {
    setVoiceTranscript('');
    setIsVoiceModalOpen(true);
    setIsListening(true);
    setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Speech recognition start failed:", e);
        }
      }
    }, 100);
  };

  const closeVoiceModalCancel = () => {
    setIsVoiceModalOpen(false);
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }
  };

  const closeVoiceModalDone = () => {
    setIsVoiceModalOpen(false);
    setIsListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    if (voiceTranscript.trim()) {
      setInputValue(voiceTranscript.trim());
    }
  };

  const handleSend = (e?: React.FormEvent, promptText?: string) => {
    if (e) e.preventDefault();
    const textToSend = promptText || inputValue.trim();
    if (!textToSend) return;

    const userMessage: Message = { text: textToSend, sender: 'user', time: getTime() };
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

        {/* ── Header (Only rendered when shown inside Modal) ── */}
        {isModal && (
          <div className="yaksha-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="yaksha-logo-badge">Y</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Yaksha <Sparkles size={14} color="var(--accent)" />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="yaksha-online-dot" />
                  AI Mentor · Doubt Resolver
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={openVoiceModal}
                title="Voice Command"
                className="yaksha-action-btn"
                style={{ color: 'var(--accent)' }}
              >
                <Mic size={15} />
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear Chat"
                className="yaksha-action-btn"
              >
                <Trash2 size={15} />
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
        )}

        {/* ── Messages ── */}
        <div className="yaksha-messages" style={{ flex: 1, overflowY: 'auto' }}>

          {/* Welcome card when no user messages yet */}
          {messages.length === 1 && !isTyping && (
            <div className="yaksha-welcome-area">
              <div className="yaksha-welcome-card">
                <div className="yaksha-welcome-logo">Y</div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Welcome to Yaksha
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 24px' }}>
                  Your AI-powered mentor for the Vicharanashala Internship. Ask me anything about the programme.
                </p>
                <div className="yaksha-prompts-grid">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="yaksha-prompt-card"
                      onClick={() => handleSend(undefined, prompt.text)}
                    >
                      <div className="yaksha-prompt-card-icon">
                        <prompt.icon size={18} />
                      </div>
                      <div>
                        <div className="yaksha-prompt-card-category">{prompt.category}</div>
                        <div className="yaksha-prompt-card-text">{prompt.text}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message bubbles (skip initial bot msg when showing welcome) */}
          {(messages.length > 1 || isTyping) && messages.map((msg, index) => (
            <div
              key={index}
              className={`yaksha-msg ${msg.sender === 'user' ? 'yaksha-msg--user' : 'yaksha-msg--bot'}`}
            >
              {msg.sender === 'bot' && (
                <div className="yaksha-msg-avatar">Y</div>
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
              <div className="yaksha-msg-avatar">Y</div>
              <div className="yaksha-bubble">
                <div className="yaksha-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input (Floating Capsule style) ── */}
        <form className="yaksha-input-area" onSubmit={(e) => handleSend(e)}>
          <div className="yaksha-input-inner">
            <button
              type="button"
              onClick={openVoiceModal}
              title="Voice Command"
              className="yaksha-voice-btn"
            >
              <Mic size={16} />
            </button>
            <input
              type="text"
              className="yaksha-input"
              placeholder="Ask about NOC, coursework, badges…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoComplete="off"
              style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '15px', fontFamily: 'var(--font)' }}
            />
            {messages.length > 1 && (
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear Chat History"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  transition: 'color 0.2s',
                  flexShrink: 0,
                  marginRight: '6px'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#ff3b30'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="submit"
              aria-label="Send message"
              disabled={!inputValue.trim()}
              className={`yaksha-send-btn ${inputValue.trim() ? 'yaksha-send-btn--active' : ''}`}
            >
              <Send size={16} />
            </button>
          </div>
        </form>

      </div>

      {/* ── Voice Pop-up overlay ── */}
      {isVoiceModalOpen && (
        <div className="yaksha-voice-overlay">
          <div className="yaksha-voice-popup">
            <div className="yaksha-voice-pulsar-ring">
              <div className="yaksha-voice-pulsar-ring-inner">
                <Mic size={32} color="var(--accent)" />
              </div>
            </div>
            
            <h3 className="yaksha-voice-popup-title">Voice Command</h3>
            <p className="yaksha-voice-popup-status">
              {isListening ? 'Listening… Speak clearly' : 'Processing voice…'}
            </p>

            {isListening && (
              <div className="yaksha-voice-wave">
                <span className="wave-bar bar-1"></span>
                <span className="wave-bar bar-2"></span>
                <span className="wave-bar bar-3"></span>
                <span className="wave-bar bar-4"></span>
                <span className="wave-bar bar-5"></span>
              </div>
            )}

            <div className="yaksha-voice-transcript-box">
              {voiceTranscript ? (
                <p className="yaksha-voice-transcript-text">"{voiceTranscript}"</p>
              ) : (
                <p className="yaksha-voice-transcript-placeholder">Say something like: "What is the NOC process?"</p>
              )}
            </div>

            <div className="yaksha-voice-popup-actions">
              <button 
                type="button" 
                onClick={closeVoiceModalCancel} 
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={closeVoiceModalDone} 
                className="btn-accent"
                style={{ padding: '8px 16px', fontSize: '13px' }}
                disabled={!voiceTranscript}
              >
                <CheckCircle2 size={14} /> Insert Text
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default YakshaChat;
