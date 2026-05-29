import React, { useState, useMemo } from 'react';

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
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const categoriesList = useMemo(() => {
    return ['All', ...distinctCategories];
  }, [distinctCategories]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
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

  return (
    <div className="faq-main">


      {/* Category Filter Pills */}
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

      {/* FAQ Controls */}
      <div className="faq-controls">
        <p className="faq-count">
          Showing <strong>{filteredFaqs.length}</strong> question{filteredFaqs.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
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

      {/* FAQ Sections */}
      {groupedFilteredFaqs.map(([category, items]) => {
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
                    <span className="q-number">{numbersMap[faq._id]}</span>
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
            })}
          </section>
        );
      })}
    </div>
  );
};

export default FaqDashboard;
