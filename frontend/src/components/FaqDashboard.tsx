import React, { useState, useMemo } from 'react';
import axios from 'axios';
import FAQPromoterCard from './admin/faq/FAQPromoterCard';
import '../styles/admin.css';

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
  isLoading?: boolean;
  onRefreshFaqs?: () => void;
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
  isLoading = false,
  onRefreshFaqs,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateFaq = async (data: { question: string; answer: string; category: string }) => {
    try {
      await axios.post('http://localhost:3001/api/faqs', data);
      setShowAddModal(false);
      if (onRefreshFaqs) {
        onRefreshFaqs();
      }
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
          {!isAdmin && (
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
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          )}

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

  if (isLoading) {
    return (
      <div className="faq-main">
        {/* Skeleton Category Pills (Only on All tab) */}
        {activeTab === 'all' && (
          <div className="category-filters" style={{ display: 'flex', gap: '10px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-pulse" style={{ height: '38px', width: i === 1 ? '100px' : '140px', borderRadius: '100px' }} />
            ))}
          </div>
        )}

        {/* Skeleton FAQ Controls */}
        <div className="faq-controls">
          <div className="skeleton-pulse" style={{ height: '20px', width: '150px', borderRadius: '4px' }} />
          <div className="skeleton-pulse" style={{ height: '36px', width: '120px', borderRadius: '4px' }} />
        </div>

        {/* Skeleton FAQ items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-pulse" style={{ 
              height: '62px', 
              width: '100%', 
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <div style={{ height: '14px', width: '24px', borderRadius: '4px' }} />
                <div style={{ height: '16px', width: `${60 + (i % 3) * 10}%`, borderRadius: '4px' }} />
              </div>
              <div style={{ height: '16px', width: '16px', borderRadius: '50%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      {/* FAQ Controls */}
      <div className="faq-controls">
        <p className="faq-count">
          Showing <strong>{filteredFaqs.length}</strong> question{filteredFaqs.length !== 1 ? 's' : ''}
          {activeTab === 'all' && activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        </p>
        <div className="faq-controls-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAdmin && (
            <button
              type="button"
              className="control-btn"
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'var(--accent)',
                color: 'var(--bg-primary)',
                borderColor: 'var(--accent)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New FAQ
            </button>
          )}
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

      {showAddModal && (
        <div className="admin-modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" style={{ width: '100%', maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <FAQPromoterCard
              mode="create"
              categories={distinctCategories}
              onSubmit={handleCreateFaq}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqDashboard;
