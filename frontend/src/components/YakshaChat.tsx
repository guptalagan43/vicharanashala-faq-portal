import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Trash2, Send, Sparkles, BookOpen, HelpCircle, Award, Clock, Mic, CheckCircle2, 
  Plus, MessageSquare, Edit2, Check, Copy, ThumbsUp, ThumbsDown, Volume2, VolumeX,
  PanelLeftClose, PanelLeft
} from 'lucide-react';
import axios from 'axios';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  time: string;
  feedback?: 'like' | 'dislike';
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface YakshaChatProps {
  isModal: boolean;
  onClose: () => void;
}

const getTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const INITIAL_MESSAGE_TEXT = "Hello! I'm <strong>Yaksha</strong>, your AI mentor for the Vicharanashala Internship. I can help you with NOC queries, offer letters, programme details, coursework doubts, and technical guidance. How can I help you today?";

const DEFAULT_SUGGESTIONS = [
  { icon: HelpCircle, text: "What is the NOC process?", category: "Logistics" },
  { icon: BookOpen, text: "Tell me about Phase 1 coursework", category: "Coursework" },
  { icon: Award, text: "How do I earn the Gold badge?", category: "Badges" },
  { icon: Clock, text: "What are the attendance rules?", category: "Policy" },
];

export const YakshaChat: React.FC<YakshaChatProps> = ({ isModal, onClose }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load FAQs from DB
  useEffect(() => {
    axios.get('http://localhost:3001/api/faqs')
      .then(res => setFaqs(res.data))
      .catch(err => console.error('Failed to load FAQs for Yaksha:', err));
  }, []);

  // Load chat sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('yaksha_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession[];
        if (parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          return;
        }
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
      }
    }
    
    // Create initial session if none exist
    const initialSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Mentorship Session",
      messages: [{ text: INITIAL_MESSAGE_TEXT, sender: 'bot', time: getTime() }],
      createdAt: new Date().toLocaleDateString(),
    };
    setSessions([initialSession]);
    setCurrentSessionId(initialSession.id);
    localStorage.setItem('yaksha_chat_sessions', JSON.stringify([initialSession]));
  }, []);

  // Sync sessions to localStorage
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem('yaksha_chat_sessions', JSON.stringify(updated));
  };

  // Get active session
  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  // Cleanup Text-To-Speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Speech Recognition Setup
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

  // Start a new chat session
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Mentorship Session",
      messages: [{ text: INITIAL_MESSAGE_TEXT, sender: 'bot', time: getTime() }],
      createdAt: new Date().toLocaleDateString(),
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setCurrentSessionId(newSession.id);
  };

  // Delete a chat session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    if (updated.length === 0) {
      const resetSession: ChatSession = {
        id: Date.now().toString(),
        title: "New Mentorship Session",
        messages: [{ text: INITIAL_MESSAGE_TEXT, sender: 'bot', time: getTime() }],
        createdAt: new Date().toLocaleDateString(),
      };
      saveSessions([resetSession]);
      setCurrentSessionId(resetSession.id);
    } else {
      saveSessions(updated);
      if (currentSessionId === id) {
        setCurrentSessionId(updated[0].id);
      }
    }
  };

  // Rename a chat session
  const startRenameSession = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditTitleText(title);
  };

  const saveSessionName = (id: string) => {
    if (!editTitleText.trim()) return;
    const updated = sessions.map(s => {
      if (s.id === id) {
        return { ...s, title: editTitleText.trim() };
      }
      return s;
    });
    saveSessions(updated);
    setEditingSessionId(null);
  };

  // Send message
  const handleSend = (e?: React.FormEvent, promptText?: string) => {
    if (e) e.preventDefault();
    const textToSend = promptText || inputValue.trim();
    if (!textToSend || !activeSession) return;

    // Create user message
    const userMessage: Message = { text: textToSend, sender: 'user', time: getTime() };
    const updatedMessages = [...activeSession.messages, userMessage];

    // If it was default session name, rename it to user's first prompt
    let sessionTitle = activeSession.title;
    if (sessionTitle === "New Mentorship Session") {
      sessionTitle = textToSend.length > 25 ? textToSend.substring(0, 25) + '...' : textToSend;
    }

    const updatedSession: ChatSession = {
      ...activeSession,
      title: sessionTitle,
      messages: updatedMessages,
    };

    const updatedSessions = sessions.map(s => s.id === currentSessionId ? updatedSession : s);
    saveSessions(updatedSessions);
    setInputValue('');
    setIsTyping(true);

    // AI bot thinking simulation
    setTimeout(() => {
      let matchedFaq: any = null;
      let maxOverlap = 0;
      const queryClean = textToSend.toLowerCase().trim();

      // Substring match
      const direct = faqs.find(f => 
        f.question.toLowerCase().includes(queryClean) || 
        queryClean.includes(f.question.toLowerCase())
      );

      if (direct) {
        matchedFaq = direct;
      } else {
        // Keyword overlap match
        const stopWords = new Set(['what', 'is', 'the', 'about', 'for', 'a', 'an', 'in', 'on', 'of', 'to', 'and', 'how', 'do', 'i', 'vins']);
        const queryWords = queryClean.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
        
        if (queryWords.length > 0) {
          faqs.forEach(f => {
            const faqClean = f.question.toLowerCase();
            const faqWords = faqClean.split(/\s+/).filter((w: string) => w.length > 2 && !stopWords.has(w));
            const overlap = queryWords.filter(w => faqWords.includes(w)).length;
            if (overlap > maxOverlap) {
              maxOverlap = overlap;
              matchedFaq = f;
            }
          });
        }
      }

      let responseText = `Thanks for your question about <strong>"${textToSend}"</strong>. This is a mock response — the live backend will query the FAQ database or use the LLM fallback (Minimax → Gemini) to generate a real answer.`;
      
      if (matchedFaq) {
        // Increment FAQ views
        axios.patch(`http://localhost:3001/api/faqs/${matchedFaq._id}/view`).catch(err => {
          console.error('Failed to increment view from Yaksha:', err);
        });
        
        responseText = `Here is what I found in the FAQs:<br/><br/><strong>Q: ${matchedFaq.question}</strong><br/><br/>${matchedFaq.answer}`;
      }

      const botResponse: Message = {
        text: responseText,
        sender: 'bot',
        time: getTime(),
      };

      const finalMessages = [...updatedMessages, botResponse];
      const finalSession = { ...updatedSession, messages: finalMessages };
      const finalSessions = sessions.map(s => s.id === currentSessionId ? finalSession : s);

      setIsTyping(false);
      saveSessions(finalSessions);
    }, 1200);
  };

  // Thumbs up / down feedback
  const handleFeedback = (index: number, type: 'like' | 'dislike') => {
    if (!activeSession) return;
    const updatedMsgs = activeSession.messages.map((msg, idx) => {
      if (idx === index) {
        return { ...msg, feedback: msg.feedback === type ? undefined : type };
      }
      return msg;
    });

    const updatedSession = { ...activeSession, messages: updatedMsgs };
    const updatedSessions = sessions.map(s => s.id === currentSessionId ? updatedSession : s);
    saveSessions(updatedSessions);
  };

  // Copy to clipboard
  const handleCopy = (text: string, index: number) => {
    // Strip HTML tags for clean text copying
    const cleanText = text.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  // Text to Speech
  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
      window.speechSynthesis?.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis?.cancel();
    const cleanText = text.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setSpeakingIndex(null);
    };
    utterance.onerror = () => {
      setSpeakingIndex(null);
    };
    ttsUtteranceRef.current = utterance;
    setSpeakingIndex(index);
    window.speechSynthesis?.speak(utterance);
  };

  // Compute dynamic quick pill suggestions based on the last message's keywords
  const contextualSuggestions = useMemo(() => {
    if (!activeSession || activeSession.messages.length <= 1) {
      return DEFAULT_SUGGESTIONS;
    }
    const lastMsg = activeSession.messages[activeSession.messages.length - 1];
    if (lastMsg.sender === 'user') return [];

    const textClean = lastMsg.text.toLowerCase();
    
    // Categories matching
    if (textClean.includes('noc')) {
      return [
        { icon: HelpCircle, text: "Who can sign the NOC?", category: "NOC Logistics" },
        { icon: BookOpen, text: "What formats are accepted for NOC?", category: "NOC Formats" },
      ];
    }
    if (textClean.includes('coursework') || textClean.includes('bronze') || textClean.includes('phase')) {
      return [
        { icon: Clock, text: "How long is the Silver phase?", category: "Phases" },
        { icon: Award, text: "Can I skip the Bronze phase?", category: "Coursework" },
      ];
    }
    if (textClean.includes('badge') || textClean.includes('gold') || textClean.includes('platinum')) {
      return [
        { icon: Award, text: "What is the Platinum badge trip?", category: "Badges" },
        { icon: HelpCircle, text: "Does badge level affect certificate?", category: "Policy" },
      ];
    }

    return DEFAULT_SUGGESTIONS.slice(0, 2);
  }, [activeSession]);

  return (
    <div className="yaksha-layout-wrapper">
      {/* Collapsible Left Sidebar for Chat History */}
      <aside className={`yaksha-history-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">
            <Sparkles size={16} /> Yaksha History
          </span>
          <button 
            type="button" 
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            title="Collapse Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <button type="button" className="new-chat-btn" onClick={handleNewChat}>
          <Plus size={16} /> New Mentorship Chat
        </button>

        <div className="history-sessions-list">
          {sessions.map(s => (
            <div 
              key={s.id} 
              className={`history-session-item ${s.id === currentSessionId ? 'active' : ''}`}
              onClick={() => setCurrentSessionId(s.id)}
            >
              <MessageSquare size={14} className="session-icon" />
              <div className="session-info">
                {editingSessionId === s.id ? (
                  <input
                    type="text"
                    className="session-rename-input"
                    value={editTitleText}
                    onChange={(e) => setEditTitleText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveSessionName(s.id);
                      if (e.key === 'Escape') setEditingSessionId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span className="session-title">{s.title}</span>
                )}
                <span className="session-date">{s.createdAt}</span>
              </div>

              <div className="session-actions">
                {editingSessionId === s.id ? (
                  <button 
                    type="button" 
                    className="session-action-btn check"
                    onClick={(e) => { e.stopPropagation(); saveSessionName(s.id); }}
                  >
                    <Check size={12} />
                  </button>
                ) : (
                  <>
                    <button 
                      type="button" 
                      className="session-action-btn edit"
                      onClick={(e) => startRenameSession(s.id, s.title, e)}
                      title="Rename Chat"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      type="button" 
                      className="session-action-btn delete"
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      title="Delete Chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Panel */}
      <aside className={`yaksha-sidebar ${!isModal ? 'yaksha-dashboard' : ''} ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        {/* Toggle Sidebar Button when closed */}
        {!isSidebarOpen && (
          <button 
            type="button" 
            className="sidebar-toggle-trigger"
            onClick={() => setIsSidebarOpen(true)}
            title="Expand Sidebar"
          >
            <PanelLeft size={20} />
          </button>
        )}

        <div className="yaksha-sticky" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* Header */}
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
            {activeSession && activeSession.messages.length === 1 && !isTyping && (
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
                    {DEFAULT_SUGGESTIONS.map((prompt, idx) => (
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

            {activeSession && activeSession.messages.length > 1 && (
              <div className="yaksha-conversation-area">
                {activeSession.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`yaksha-msg ${msg.sender === 'user' ? 'yaksha-msg--user' : 'yaksha-msg--bot'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="yaksha-msg-avatar">Y</div>
                    )}
                    <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
                      <div
                        className="yaksha-bubble"
                        dangerouslySetInnerHTML={{ __html: msg.text }}
                      />
                      
                      {/* Bot Message Toolbar Actions */}
                      {msg.sender === 'bot' && (
                        <div className="bot-message-actions-bar">
                          <button 
                            type="button" 
                            className="message-action-icon"
                            onClick={() => handleCopy(msg.text, index)}
                            title="Copy message"
                          >
                            <Copy size={12} />
                            {copiedIndex === index && <span className="action-tooltip">Copied!</span>}
                          </button>
                          
                          <button 
                            type="button" 
                            className={`message-action-icon ${speakingIndex === index ? 'speaking' : ''}`}
                            onClick={() => handleSpeak(msg.text, index)}
                            title={speakingIndex === index ? "Stop Speaking" : "Read Aloud"}
                          >
                            {speakingIndex === index ? <VolumeX size={12} /> : <Volume2 size={12} />}
                          </button>

                          <button 
                            type="button" 
                            className={`message-action-icon ${msg.feedback === 'like' ? 'liked' : ''}`}
                            onClick={() => handleFeedback(index, 'like')}
                            title="Helpful response"
                          >
                            <ThumbsUp size={12} />
                          </button>

                          <button 
                            type="button" 
                            className={`message-action-icon ${msg.feedback === 'dislike' ? 'disliked' : ''}`}
                            onClick={() => handleFeedback(index, 'dislike')}
                            title="Not helpful"
                          >
                            <ThumbsDown size={12} />
                          </button>
                        </div>
                      )}
                      
                      <div className="yaksha-time">{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
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

          {/* Contextual suggested pills */}
          {contextualSuggestions.length > 0 && activeSession && activeSession.messages.length > 1 && (
            <div className="yaksha-contextual-suggestions animate-fade-in">
              {contextualSuggestions.map((sug, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  className="suggestion-pill"
                  onClick={() => handleSend(undefined, sug.text)}
                >
                  <Sparkles size={11} className="pill-icon" />
                  {sug.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Panel (Floating Capsule style) */}
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
      </aside>

      {/* Voice Overlay Modal */}
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
    </div>
  );
};

export default YakshaChat;
