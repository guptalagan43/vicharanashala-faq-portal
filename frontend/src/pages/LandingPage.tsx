import React, { useRef, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ChevronDown,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  FileText,
  Shield,
  Clock,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import '../styles/landing.css';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal animations
    const reveals = document.querySelectorAll('.reveal-up');
    reveals.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    });

    // Parallax glow orbs shift with scroll
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="landing-page" ref={containerRef}>

      {/* ── Ambient background glow (parallax) ── */}
      <div className="lp-bg" ref={glowRef}>
        <div className="lp-bg-orb lp-bg-orb--1" />
        <div className="lp-bg-orb lp-bg-orb--2" />
        <div className="lp-bg-orb lp-bg-orb--3" />
      </div>

      {/* ────────────────────────────────────────────────────────
          HERO
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section lp-section--hero">
        <div className="hero-inner">
          <span className="lp-overline">Vicharanashala Lab · IIT Ropar</span>
          <h1 className="lp-heading lp-heading--hero">
            Vicharanashala<br />Internship Programme
          </h1>
          <p className="hero-subtitle">
            A two-month, full-attention engagement in applied AI and open-source
            software engineering. Real problems. Real code. Open to all.
          </p>
          <div className="hero-actions">
            <Link to="/faq" className="btn-primary">
              Explore FAQs <ArrowRight size={16} />
            </Link>
            <Link to="/chat" className="btn-secondary">
              Ask Yaksha <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll</span>
          <ChevronDown size={18} />
        </div>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          THE PROGRAMME
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <span className="lp-overline reveal-up">About the programme</span>
        <h2 className="lp-heading reveal-up">The Programme</h2>
        <p className="lp-body reveal-up">
          The Vicharanashala internship is a two-month, full-attention engagement at
          the lab of <strong>Prof. Sudarshan Iyengar</strong> at IIT Ropar. We work on real,
          open-source software for India-centric problems — agriculture
          (<em>Annam.AI</em>), education (<em>ViBe</em>), and a steady stream of other
          research-driven projects.
        </p>

        <div className="programme-grid reveal-up" style={{ marginTop: '40px' }}>
          <div className="programme-card">
            <h3>VINS — Online</h3>
            <p>
              <strong>Vicharanashala Internship.</strong> Open to every candidate
              who performed well in the AI interview. Conducted entirely online — you work
              from your own location.
            </p>
            <p style={{ marginTop: '12px' }}>
              Start anytime in 2026. Two-month duration with a one-month grace period.
              Everything must finish by 31 December 2026.
            </p>
            <p style={{ marginTop: '12px' }}>
              <em>No stipend.</em> The programme itself is free for you — we charge nothing.
            </p>
          </div>
        </div>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          FOUR-BADGE JOURNEY (Roadmap)
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <span className="lp-overline reveal-up">Progression</span>
        <h2 className="lp-heading reveal-up">The Four-Badge Journey</h2>
        <p className="lp-body reveal-up">
          Every intern follows this progression. The first two badges are the
          internship proper; the last two are upside.
        </p>

        <div className="badge-roadmap">
          <div className="badge-step reveal-up">
            <div className="badge-dot badge-dot--bronze">🥉</div>
            <div className="badge-phase">Phase 1 · Training</div>
            <h4>Bronze Badge</h4>
            <p>
              Training — a course or a direct assignment, decided per candidate by the
              mentor based on what you already know.
            </p>
            <span className="badge-required">Usually — entry requirement</span>
          </div>

          <div className="badge-step reveal-up">
            <div className="badge-dot badge-dot--silver">🥈</div>
            <div className="badge-phase">Phase 2 · The Work</div>
            <h4>Silver Badge</h4>
            <p>
              An open-source project with a Vicharanashala mentor. This is the actual
              internship work — building real, production-ready code.
            </p>
            <span className="badge-required">Yes — the actual work</span>
          </div>

          <div className="badge-step reveal-up">
            <div className="badge-dot badge-dot--gold">🥇</div>
            <div className="badge-phase">Phase 3 · Excellence</div>
            <h4>Gold Badge</h4>
            <p>
              A genuinely significant Silver contribution — a feature in itself.
              Not required, but a quality mark on your Silver work.
            </p>
            <span className="badge-required">No — a quality mark</span>
          </div>

          <div className="badge-step reveal-up">
            <div className="badge-dot badge-dot--plat">🏆</div>
            <div className="badge-phase">Phase 4 · Beyond</div>
            <h4>Platinum Badge</h4>
            <p>
              Open invitation to return to the lab in the next twelve months.
              Nominal stipend on visit. The fourth star is earned during that visit.
            </p>
            <span className="badge-required">No — post-internship pathway</span>
          </div>
        </div>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          WHAT WE EXPECT
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <span className="lp-overline reveal-up">Commitment</span>
        <h2 className="lp-heading reveal-up">What We Expect</h2>
        <p className="lp-body reveal-up">
          This is a serious internship, not a summer job. Plan for <strong>6 to 10
          hours of focused work a day</strong>, sometimes more, for the full window.
          The most common reason interns drop out mid-way is competing commitments.
          If your time is fragmented, please wait for a window where you can give it
          full attention.
        </p>

        <div className="expect-stats reveal-up">
          <div className="expect-stat">
            <div className="stat-value">85%</div>
            <div className="stat-label">Zoom Attendance</div>
          </div>
          <div className="expect-stat">
            <div className="stat-value">85%</div>
            <div className="stat-label">Poll Response Rate</div>
          </div>
          <div className="expect-stat">
            <div className="stat-value">50%</div>
            <div className="stat-label">Quiz Pass Mark</div>
          </div>
        </div>

        <p className="lp-body reveal-up" style={{ marginTop: '24px' }}>
          Attendance and participation are tracked strictly over a rolling five-day
          window. If any metric falls below the bar, you are moved to the next batch.
          Completing both Bronze and Silver earns you a certificate from Vicharanashala
          at IIT Ropar — it means something because it's earned, not distributed.
        </p>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          PROJECT, TECHNOLOGY, DOMAIN
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <span className="lp-overline reveal-up">Technology</span>
        <h2 className="lp-heading reveal-up">Project, Technology, Domain</h2>
        <p className="lp-body reveal-up">
          We do not pre-declare the problem you'll work on. The approach is
          <strong> problem-centred</strong>: based on your inclination and background,
          your mentor assigns a real lab problem, and you work backwards — learn the
          technology you need, then solve the problem.
        </p>
        <p className="lp-body reveal-up" style={{ marginTop: '16px' }}>
          You may end up working on any of these areas depending on what fits.
          Insisting on a specific stack or domain after joining is not viewed
          favourably.
        </p>

        <div className="tech-tags reveal-up">
          <span className="tech-tag">AI / ML</span>
          <span className="tech-tag">NLP</span>
          <span className="tech-tag">LLMs</span>
          <span className="tech-tag">Web Development</span>
          <span className="tech-tag">Systems</span>
          <span className="tech-tag">Annam.AI</span>
          <span className="tech-tag">ViBe</span>
          <span className="tech-tag">Open-source Infra</span>
          <span className="tech-tag">React</span>
          <span className="tech-tag">Node.js</span>
          <span className="tech-tag">MongoDB</span>
          <span className="tech-tag">Python</span>
        </div>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          WHY THE INTERVIEW IS ON SAMAGAMA
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <span className="lp-overline reveal-up">Selection</span>
        <h2 className="lp-heading reveal-up">Why the Interview Is on samagama.in</h2>
        <p className="lp-body reveal-up">
          Every candidate goes through a structured AI-led interview at{' '}
          <a href="https://samagama.in" className="lp-link">samagama.in</a>{' '}
          with our interviewer agent, <strong>Yaksha</strong>. This is not a gimmick.
          The interview gives every applicant — irrespective of college brand, network,
          or geography — the same calibrated conversation about their work.
          Prof. Iyengar reads every transcript personally.
        </p>

        <div className="yaksha-box reveal-up">
          <p>
            The result panel on <strong>samagama.in</strong> (yellow VINS) confirms
            your selection and contains the canonical procedure for what to do next.
            The interview is the only formal assessment — no separate test, coding round,
            or shortlist call.
          </p>
        </div>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          CROWD-SOURCED FAQ — RAISE / RESOLVE
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <span className="lp-overline reveal-up">Community</span>
        <h2 className="lp-heading reveal-up">The Peer-Help Loop</h2>
        <p className="lp-body reveal-up">
          This is where the peer-help loop lives. You can ask a question (the system
          routes it to another intern), pick a question out of the queue to answer,
          or track the status of issues you've raised.
        </p>

        <div className="faq-action-grid reveal-up">
          <Link to="/faq" className="faq-action-card faq-action-card--raise">
            <div className="faq-action-icon">
              <AlertCircle size={22} />
            </div>
            <h3>Raise an Issue</h3>
            <p>
              Stuck on something? Describe it. Another intern will answer
              and a senior will review before it reaches you.
            </p>
            <span className="faq-action-label">
              Submit a question <ArrowRight size={14} />
            </span>
          </Link>

          <Link to="/faq" className="faq-action-card faq-action-card--resolve">
            <div className="faq-action-icon">
              <CheckCircle2 size={22} />
            </div>
            <h3>Resolve a Question</h3>
            <p>
              Help another intern by picking the next question from the queue.
              Approved answers earn Spurti Points.
            </p>
            <span className="faq-action-label">
              Answer a question <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          LOGISTICS IN BRIEF
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <span className="lp-overline reveal-up">Operations</span>
        <h2 className="lp-heading reveal-up">Logistics in Brief</h2>

        <ul className="logistics-list">
          <li className="logistics-item reveal-up">
            <div className="logistics-icon"><FileText size={18} /></div>
            <div>
              <h4>Result Panel</h4>
              <p>Visible on samagama.in for one week after results. View it, opt in to VINS, and complete the NOC step within this window.</p>
            </div>
          </li>
          <li className="logistics-item reveal-up">
            <div className="logistics-icon"><Shield size={18} /></div>
            <div>
              <h4>NOC</h4>
              <p>A No-Objection Certificate from your institution, signed and stamped by an authorised signatory. We provide a printable format — download it from the dashboard.</p>
            </div>
          </li>
          <li className="logistics-item reveal-up">
            <div className="logistics-icon"><Clock size={18} /></div>
            <div>
              <h4>Offer Letter</h4>
              <p>Issued automatically — as a provisional offer with self-declaration, or on NOC validation. You may begin only after your official NOC is uploaded and validated.</p>
            </div>
          </li>
          <li className="logistics-item reveal-up">
            <div className="logistics-icon"><MessageSquare size={18} /></div>
            <div>
              <h4>During the Internship</h4>
              <p>Discord for community, Zoom for meetings, GitHub for code, Yaksha chat for one-on-one queries.</p>
            </div>
          </li>
        </ul>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          COST
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section">
        <span className="lp-overline reveal-up">Cost</span>
        <h2 className="lp-heading reveal-up" style={{ textAlign: 'center' }}>Cost</h2>

        <div className="cost-highlight reveal-up">
          <div className="cost-badge">₹0</div>
          <p>
            The internship is <strong>completely free</strong>. We charge nothing — for the course,
            for mentorship, for any part of the programme. Vicharanashala is funded by
            initiatives and agencies that cover the cost. Because someone else is paying,
            we keep the rigour high. Stellar performers may receive a selected stipend.
          </p>
        </div>
      </section>

      <hr className="lp-divider" />

      {/* ────────────────────────────────────────────────────────
          WHAT TO DO NEXT
      ──────────────────────────────────────────────────────── */}
      <section className="lp-section" style={{ paddingBottom: '160px' }}>
        <span className="lp-overline reveal-up">Get started</span>
        <h2 className="lp-heading reveal-up">What to Do Next</h2>

        <ol className="steps-list">
          <li className="step-item reveal-up">
            <div className="step-number">1</div>
            <p>Go to <a href="https://samagama.in" className="lp-link">samagama.in</a> and sign in.</p>
          </li>
          <li className="step-item reveal-up">
            <div className="step-number">2</div>
            <p>Read your result panel carefully. It tells you the track and the next step.</p>
          </li>
          <li className="step-item reveal-up">
            <div className="step-number">3</div>
            <p>Tell Yaksha you want to opt in to VINS, in the exact phrase shown on the panel.</p>
          </li>
          <li className="step-item reveal-up">
            <div className="step-number">4</div>
            <p>Download the NOC, get it signed and stamped, and upload it back via the <strong>Upload NOC</strong> button on the panel.</p>
          </li>
          <li className="step-item reveal-up">
            <div className="step-number">5</div>
            <p>Wait for your offer letter; show up on your start date with your full attention.</p>
          </li>
        </ol>

        <div className="reveal-up" style={{ marginTop: '56px', textAlign: 'center' }}>
          <p className="lp-body lp-body--center" style={{ marginBottom: '24px' }}>
            If you have a question this page doesn't answer, the FAQ covers most of it.
            Otherwise, log in at samagama.in and ask Yaksha.
          </p>
          <div className="hero-actions">
            <Link to="/faq" className="btn-primary">
              Browse the FAQ <ArrowRight size={16} />
            </Link>
            <Link to="/chat" className="btn-secondary">
              Ask Yaksha <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
