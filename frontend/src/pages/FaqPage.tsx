import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import '../reference.css';
import '../mobile.css';
import FaqDashboard from '../components/FaqDashboard';

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  view_count?: number;
}

export const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [tocOpen, setTocOpen] = useState(false);
  const [activeTocSection, setActiveToc] = useState('s-1');

  useEffect(() => {
    axios.get<FaqItem[]>('http://localhost:3000/api/faqs')
      .then((response) => {
        setFaqs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching FAQs:', error);
      });
  }, []);

  // Compute stable categories, question numbers, and section numbers
  const { distinctCategories, numbersMap, sectionNumbersMap } = useMemo(() => {
    const sortedCats = Array.from(new Set(faqs.map((faq) => faq.category))).sort();
    
    // Group unfiltered faqs by category to assign stable item indices
    const grouped: Record<string, FaqItem[]> = {};
    faqs.forEach((faq) => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });

    const numMap: Record<string, string> = {};
    const secMap: Record<string, string> = {};

    sortedCats.forEach((cat, catIdx) => {
      secMap[cat] = String(catIdx + 1).padStart(2, '0');
      const items = grouped[cat] || [];
      items.forEach((faq, faqIdx) => {
        numMap[faq._id] = `${catIdx + 1}.${faqIdx + 1}`;
      });
    });

    return {
      distinctCategories: sortedCats,
      numbersMap: numMap,
      sectionNumbersMap: secMap,
    };
  }, [faqs]);

  // Generate dynamic TOC items with clean, shortened labels
  const TOC_ITEMS = useMemo(() => {
    return distinctCategories.map((cat, idx) => {
      let label = cat;
      if (cat.startsWith('NOC')) label = 'NOC';
      else if (cat.startsWith('About')) label = 'About the Internship';
      else if (cat.startsWith('Timing')) label = 'Timing & Dates';
      else if (cat.startsWith('Selection')) label = 'Selection & Offer';
      else if (cat.startsWith('Work')) label = 'Work & Mentorship';
      else if (cat.startsWith('Rosetta')) label = 'Rosetta Journal';
      else if (cat.startsWith('ViBe')) label = 'ViBe Platform';
      else if (cat.startsWith('Yaksha')) label = 'Yaksha Chat';
      else if (cat.startsWith('Interviews')) label = 'Interviews';
      else if (cat.startsWith('Code of Conduct')) label = 'Code of Conduct';
      else if (cat.startsWith('Team')) label = 'Team Formation';
      else if (cat.startsWith('Phase 1')) label = 'Phase 1 Coursework';
      else if (cat.startsWith('Certificate')) label = 'Certificate';

      return {
        num: String(idx + 1).padStart(2, '0'),
        label,
        section: `s-${idx + 1}`,
      };
    });
  }, [distinctCategories]);

  // Update active TOC link on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.faq-section');
      let current = '';
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 180) {
          current = section.id;
        }
      });
      if (current) {
        setActiveToc(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTocClick = (section: string) => {
    setActiveCategory('All');
    setSearchQuery('');
    setActiveToc(section);
    setTocOpen(false);

    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-inner">
          <h1 className="hero-title" style={{ color: 'var(--accent)' }}>Frequently Asked<br />Questions</h1>
          <p className="hero-subtitle">
            Everything you need to know about the Vicharanashala Internship Programme (VINS).
            Search or browse by category below.
          </p>
          <div className="search-container" style={{ marginTop: '24px', maxWidth: '600px', margin: '24px auto 0' }}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              id="faq-search"
              placeholder="Search FAQ — try NOC, stipend, certificate…"
              aria-label="Search FAQ"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="mobile-toc-wrapper">
        <button
          className={`mobile-toc-toggle${tocOpen ? ' open' : ''}`}
          aria-expanded={tocOpen}
          aria-controls="mobile-toc-panel"
          onClick={() => setTocOpen(v => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="15" y2="18" />
          </svg>
          Contents
          <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
               style={{ marginLeft: 'auto' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div id="mobile-toc-panel" className={`mobile-toc-panel${tocOpen ? ' open' : ''}`}>
          <nav className="toc-nav">
            {TOC_ITEMS.map(item => (
              <a
                key={item.section}
                href={`#${item.section}`}
                className={`toc-link${activeTocSection === item.section ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleTocClick(item.section); }}
              >
                <span className="toc-num">{item.num}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="main-layout" id="main-layout">
        <aside className="toc-sidebar" id="toc-sidebar">
          <div className="toc-sticky">
            <h2 className="toc-heading">Contents</h2>
            <nav className="toc-nav" id="toc-nav">
              {TOC_ITEMS.map(item => (
                <a
                  key={item.section}
                  href={`#${item.section}`}
                  className={`toc-link${activeTocSection === item.section ? ' active' : ''}`}
                  data-section={item.section}
                  onClick={(e) => { e.preventDefault(); handleTocClick(item.section); }}
                >
                  <span className="toc-num">{item.num}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <FaqDashboard
          faqs={faqs}
          searchQuery={searchQuery}

          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          distinctCategories={distinctCategories}
          numbersMap={numbersMap}
          sectionNumbersMap={sectionNumbersMap}
        />
      </div>
    </>
  );
};
