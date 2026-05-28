import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './reference.css';
import './mobile.css';
import FaqDashboard from './components/FaqDashboard';
import YakshaChat from './components/YakshaChat';

interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
  view_count?: number;
}

function App() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [tocOpen, setTocOpen] = useState(false);
  const [activeTocSection, setActiveToc] = useState('s-1');
  const [chatOpen, setChatOpen] = useState(false);

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
        // Give some threshold offset for active sidebar heading
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

    // Give state updates a moment to render all sections before scrolling
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <>
      {/* ─── HEADER ─── */}
      <header className="site-header" id="site-header">
        <div className="header-inner">
          <a href="#" className="logo">
            <span className="logo-mark">V</span>
            <span className="logo-text">Vicharanashala</span>
          </a>
          <nav className="site-nav">
            <a href="https://samagama.in/internship" target="_blank" rel="noopener">Overview</a>
            <a href="#" className="active">FAQ</a>
            <a href="https://samagama.in" target="_blank" rel="noopener">samagama.in</a>
          </nav>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="hero" id="hero">
        <div className="hero-inner">
          <p className="hero-badge">IIT Ropar · Applied AI · Open-Source</p>
          <h1 className="hero-title">Frequently Asked<br />Questions</h1>
          <p className="hero-subtitle">
            Everything you need to know about the Vicharanashala Internship Programme (VINS).
            Search or browse by category below.
          </p>
        </div>
      </section>

      {/* MOBILE-ONLY TOC TOGGLE */}
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

      {/* ─── MAIN LAYOUT — exactly 3 grid children ─── */}
      <div className="main-layout" id="main-layout">

        {/* Column 1 — Desktop TOC sidebar */}
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

        {/* Column 2 — FAQ content */}
        <FaqDashboard
          faqs={faqs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          distinctCategories={distinctCategories}
          numbersMap={numbersMap}
          sectionNumbersMap={sectionNumbersMap}
        />

        {/* Column 3 — Yaksha chat (desktop sidebar) */}
        <YakshaChat isModal={false} onClose={() => {}} />

      </div>

      {/* ─── FOOTER ─── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-mark">V</span>
            <p>Vicharanashala Lab for Education Design · IIT Ropar</p>
          </div>
          <div className="footer-links">
            <a href="https://samagama.in" target="_blank" rel="noopener">samagama.in</a>
            <a href="https://samagama.in/internship" target="_blank" rel="noopener">Internship Overview</a>
          </div>
          <p className="footer-note">
            FAQs are maintained by the VINS team. For queries not covered here, contact us via the{' '}
            <a href="#" onClick={e => { e.preventDefault(); setChatOpen(true); }}>Yaksha chat</a>.
          </p>
        </div>
      </footer>

      {/* ─── YAKSHA FAB — mobile only ─── */}
      <button
        className="yaksha-fab"
        aria-label="Open Yaksha chat"
        onClick={() => setChatOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* ─── YAKSHA MODAL — mobile only ─── */}
      <div
        className={`yaksha-modal-overlay${chatOpen ? ' open' : ''}`}
        onClick={e => { if (e.target === e.currentTarget) setChatOpen(false); }}
        aria-modal="true"
        role="dialog"
        aria-label="Yaksha-mini chat"
      >
        <div className="yaksha-modal-sheet">
          <YakshaChat isModal={true} onClose={() => setChatOpen(false)} />
        </div>
      </div>
    </>
  );
}

export default App;
