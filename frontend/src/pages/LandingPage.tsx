import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, Code, BrainCircuit, MessageSquare, HelpCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/landing.css';

export const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const aboutRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const panel1Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const panel2Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const cta1Ref = useScrollReveal<HTMLAnchorElement>({ threshold: 0.2 });
  const cta2Ref = useScrollReveal<HTMLAnchorElement>({ threshold: 0.2 });

  return (
    <div className="landing-page">
      {/* ─── Hero Section ─── */}
      <section className="landing-hero">
        <div className="hero-bg-glow" style={{ transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.001})` }}></div>
        <div className="hero-content" style={{ transform: `translateZ(50px) translateY(${scrollY * 0.4}px)` }}>
          <div className="section-label" style={{ marginBottom: '32px' }}>
            Vicharanashala Lab · IIT Ropar
          </div>
          <h1 className="hero-title-main">
            The Future of <br /> Applied AI Engineering
          </h1>
          <p className="hero-subtitle-main">
            An open-source, hands-on internship programme focusing on AI fundamentals 
            and the MERN stack. Built by the community, for the community.
          </p>
        </div>
        
        <div className="scroll-indicator" style={{ opacity: Math.max(0, 1 - scrollY / 300) }}>
          <span>Scroll to explore</span>
          <ChevronDown />
        </div>
      </section>

      {/* ─── About Section (3D Tilt) ─── */}
      <section className="landing-about">
        <div 
          ref={aboutRef} 
          className="about-card reveal-scale"
        >
          <h2 className="about-title">What is VINS?</h2>
          <p className="about-text">
            Vicharanashala Internship Programme (VINS) is an ambitious initiative at IIT Ropar 
            aimed at democratizing high-quality technical education. Our goal is to equip students 
            with real-world software engineering skills by contributing to actual open-source products.
            <br /><br />
            Unlike traditional internships, you don't just learn — you build, collaborate, and 
            deploy production-ready code.
          </p>
        </div>
      </section>

      {/* ─── Curriculum Section ─── */}
      <section className="landing-curriculum">
        <div className="section-label">The Curriculum</div>
        
        <div className="curriculum-grid">
          <div ref={panel1Ref} className="curriculum-panel reveal-up">
            <div className="panel-icon">
              <BrainCircuit size={24} />
            </div>
            <h3 className="panel-title">AI Fundamentals</h3>
            <ul className="panel-list">
              <li>Core Machine Learning Concepts</li>
              <li>Neural Networks & Deep Learning</li>
              <li>Prompt Engineering</li>
              <li>LLM Integration & Fine-Tuning</li>
              <li>RAG (Retrieval-Augmented Generation)</li>
            </ul>
          </div>
          
          <div ref={panel2Ref} className="curriculum-panel reveal-up" style={{ transitionDelay: '0.2s' }}>
            <div className="panel-icon">
              <Code size={24} />
            </div>
            <h3 className="panel-title">MERN Stack Mastery</h3>
            <ul className="panel-list">
              <li>Modern React & UI/UX Design</li>
              <li>Node.js & Express Architecture</li>
              <li>MongoDB & Data Modeling</li>
              <li>RESTful APIs & GraphQL</li>
              <li>Deployment & DevOps basics</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── CTAs Section ─── */}
      <section className="landing-ctas">
        <Link to="/faq" className="cta-card reveal-up" ref={cta1Ref}>
          <div className="cta-icon">
            <HelpCircle size={32} />
          </div>
          <h3 className="cta-title">Crowd-Sourced FAQ</h3>
          <p className="cta-desc">
            Browse our extensive knowledge base generated and verified by the internship community itself.
          </p>
          <span className="cta-btn">Browse FAQs</span>
        </Link>
        
        <Link to="/chat" className="cta-card reveal-up" ref={cta2Ref} style={{ transitionDelay: '0.2s' }}>
          <div className="cta-icon">
            <MessageSquare size={32} />
          </div>
          <h3 className="cta-title">Yaksha Chatbot</h3>
          <p className="cta-desc">
            Can't find your answer? Ask our AI assistant Yaksha, trained specifically on the VINS program.
          </p>
          <span className="cta-btn">Ask Yaksha</span>
        </Link>
      </section>
    </div>
  );
};
