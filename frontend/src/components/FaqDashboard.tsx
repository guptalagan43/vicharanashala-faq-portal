import React, { useState, useMemo } from 'react';
import axios from 'axios';

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  view_count?: number;
}

interface FaqDashboardProps {
  faqs: FaqItem[];
  searchQuery: string;

  activeCategory: string;
  setActiveCategory: (category: string) => void;
  distinctCategories: string[];
  numbersMap: Record<string, string>;
  sectionNumbersMap: Record<string, string>;

  // Bookmarks extension
  bookmarkedIds?: string[];
  onToggleBookmark?: (faqId: string) => void;
  isAdmin?: boolean;
  activeTab?: string;
  onFaqAdded?: (newFaq: FaqItem) => void;
}

export const FaqDashboard: React.FC<FaqDashboardProps> = ({
  faqs,
  searchQuery,

  activeCategory,
  setActiveCategory,
  distinctCategories,
  numbersMap,
  sectionNumbersMap,
  bookmarkedIds = [],
  onToggleBookmark = () => {},
  isAdmin = false,
  activeTab = 'all',
  onFaqAdded,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim() || !newCategory.trim()) return;

    try {
      const response = await axios.post<FaqItem>('http://localhost:3001/api/faqs', {
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
        category: newCategory.trim(),
      });
      
      if (onFaqAdded) {
        onFaqAdded(response.data);
      }
      
      setNewQuestion('');
      setNewAnswer('');
      setNewCategory('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create FAQ:', err);
    }
  };

  const categoriesList = useMemo(() => {
    return ['All', ...distinctCategories];
  }, [distinctCategories]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeTab !== 'all' || activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery, activeTab]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);

        // Find and increment locally for instant Admin visual feedback
        const faqItem = faqs.find(f => f._id === id);
        if (faqItem) {
          faqItem.view_count = (faqItem.view_count || 0) + 1;
        }

        // Increment view count in MongoDB
        axios.patch(`http://localhost:3001/api/faqs/${id}/view`).catch(err => {
          console.error('Failed to increment FAQ view count:', err);
        });
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set(filteredFaqs.map(f => f._id));
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Group filtered FAQs by category for section rendering, sorted by stable order
  const groupedFilteredFaqs = useMemo(() => {
    const grouped: Record<string, FaqItem[]> = {};
    filteredFaqs.forEach((faq) => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });

    return distinctCategories
      .filter((cat) => grouped[cat])
      .map((cat) => [cat, grouped[cat]] as [string, FaqItem[]]);
  }, [filteredFaqs, distinctCategories]);

  const allExpanded = expandedIds.size > 0 && expandedIds.size === filteredFaqs.length;

  const renderFaqItem = (faq: FaqItem, isExpanded: boolean, index?: number) => {
    const displayNum = activeTab === 'all' ? (numbersMap[faq._id] ?? '') : (index !== undefined ? `${index + 1}` : '');
    return (
      <div
        key={faq._id}
        className={`faq-item${isExpanded ? ' active' : ''}`}
      >
        <button
          className="faq-question"
          aria-expanded={isExpanded}
          onClick={() => toggleExpanded(faq._id)}
        >
          {displayNum && <span className="q-number">{displayNum}</span>}
          <span className="q-text">{faq.question}</span>

          {/* Bookmark Toggle Button */}
          <button
            type="button"
            className={`faq-bookmark-btn ${bookmarkedIds.includes(faq._id) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(faq._id);
            }}
            title={bookmarkedIds.includes(faq._id) ? "Remove Bookmark" : "Bookmark FAQ"}
          >
            <svg viewBox="0 0 24 24" fill={bookmarkedIds.includes(faq._id) ? "var(--accent)" : "none"} stroke="var(--accent)" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>

          {/* View Tracker (Admin only on Trending tab) */}
          {isAdmin && activeTab === 'most-asked' && (
            <span
              className="faq-view-tracker"
              title="Total views (Admin only)"
              onClick={(e) => e.stopPropagation()}
            >
              🔥 {faq.view_count || 0}
            </span>
          )}

          <span className="chevron-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>
        <div className="faq-answer" role="region">
          <div 
            className="answer-content"
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="faq-main">

      {/* Category Filter Pills (Only on All tab) */}
      {activeTab === 'all' && (
        <div className="category-filters">
          {categoriesList.map((category) => (
            <button
              key={category}
              className={`category-pill${activeCategory === category ? ' active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category === 'All' ? 'All Questions' : category}
            </button>
          ))}
        </div>
      )}

      {/* Admin Add FAQ Section */}
      {isAdmin && (
        <div className="admin-add-faq-section" style={{ marginBottom: '24px' }}>
          {!showAddForm ? (
            <button
              type="button"
              className="control-btn"
              onClick={() => setShowAddForm(true)}
              style={{ background: 'var(--accent)', color: 'var(--text-inverse)', fontWeight: 600, padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}
            >
              + Add New FAQ
            </button>
          ) : (
            <form onSubmit={handleAddFaq} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-active)', borderRadius: 'var(--radius)', padding: '24px', animation: 'fadeInUp 0.3s ease' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)', marginBottom: '16px' }}>Add New FAQ</h3>
              
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., What is the NOC upload deadline?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Answer (HTML supported)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide the resolved answer text here..."
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Category</label>
                <select
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="">Select a Category</option>
                  {distinctCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="General">General</option>
                  <option value="Technical">Technical</option>
                  <option value="Stipend">Stipend</option>
                  <option value="Policy">Policy</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="control-btn"
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="control-btn"
                  style={{ background: 'var(--accent)', color: 'var(--text-inverse)', fontWeight: 600 }}
                >
                  Publish FAQ
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* FAQ Controls */}
      <div className="faq-controls">
        <p className="faq-count">
          Showing <strong>{filteredFaqs.length}</strong> question{filteredFaqs.length !== 1 ? 's' : ''}
          {activeTab === 'all' && activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        </p>
        <div className="faq-controls-right" style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            className="control-btn"
            onClick={allExpanded ? collapseAll : expandAll}
          >
            {allExpanded ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 11l-5-5-5 5M17 18l-5-5-5 5" />
                </svg>
                Collapse all
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 13l-5 5-5-5M17 6l-5 5-5-5" />
                </svg>
                Expand all
              </>
            )}
          </button>
        </div>
      </div>

      {/* No Results */}
      {filteredFaqs.length === 0 && (
        <div className="no-results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="8" x2="14" y2="14" />
            <line x1="14" y1="8" x2="8" y2="14" />
          </svg>
          <h3>No questions found</h3>
          <p>Try a different keyword or browse by category above.</p>
        </div>
      )}

      {activeTab === 'all' ? (
        /* FAQ Sections */
        groupedFilteredFaqs.map(([category, items]) => {
          const secId = `s-${distinctCategories.indexOf(category) + 1}`;
          return (
            <section key={category} id={secId} className="faq-section">
              <div className="section-header">
                <span className="section-number">{sectionNumbersMap[category] ?? '00'}</span>
                <h2 className="section-title">{category}</h2>
                <span className="section-count">{items.length}</span>
              </div>

              {items.map((faq) => {
                const isExpanded = expandedIds.has(faq._id);
                return renderFaqItem(faq, isExpanded);
              })}
            </section>
          );
        })
      ) : (
        /* Flat list for subpages (Most Asked, Latest, Bookmarked) */
        <div className="faq-flat-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIds.has(faq._id);
            return renderFaqItem(faq, isExpanded, idx);
          })}
        </div>
      )}
    </div>
  );
};

export default FaqDashboard;
