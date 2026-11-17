import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowUpRight, ArrowRight, ScanLine, Sparkles, ShieldCheck, Leaf, Heart, Flower2, Sun, Plus, Menu, X, Check, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import heroImage from '@/assets/skintel-hero.jpg';
import productImage from '@/assets/skintel-products.jpg';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Skintel — Skincare that gets you' },
    { name: 'description', content: 'Personal skincare intelligence for Indian teens. Decode ingredients, explore simpler routines, and understand what belongs on your shelf. Discover the pre-launch Skintel experience.' },
    { property: 'og:title', content: 'Skintel — Skincare that gets you' },
    { property: 'og:description', content: 'Your age. Your skin. Your shelf. Meet personal skincare intelligence built for Indian teens.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

const tools = [
  { icon: ScanLine, title: 'Decode your ingredients', text: 'Big ingredient names. Simple explanations. Understand what’s in the bottle, and what it’s doing for your skin.' },
  { icon: CalendarDays, title: 'Find your kind of routine', text: 'Not someone else’s 10-step shelf. A day-and-night plan built around your skin, your age, and your budget.' },
  { icon: Sparkles, title: 'Know the why', text: 'From “what is niacinamide?” to “do I need this?” Make sense of skincare, without the fear or the jargon.' },
];
const faqs = [
  ['What makes Skintel different?', 'Most ingredient checkers rate a bottle. Skintel is being built around the person holding it: your age, skin type, budget, and existing shelf. Our starting point is “is this right for you?” — not a generic good-or-bad score.'],
  ['Is Skintel available yet?', 'Skintel is pre-launch. Create a free account to use Skintel Studio, where you can save a skin profile, check your skin from a photo, and read product labels using AI. It is an early version, so results can be wrong and are not a substitute for professional advice.'],
  ['Is this medical advice?', 'No. Skintel is an educational skincare companion, not a dermatologist. The guidance needs professional review before launch. If you have persistent acne, irritation, or a skin condition, speak with a qualified professional.'],
  ['How will you protect younger users?', 'Your profile is saved to your account, and only results you choose to save are kept. Photos are sent securely to an AI service only when you tap analyse, and Skintel never stores them. Under-18s need a parent or guardian to confirm before using photo features; at this stage that confirmation is self-declared, not independently verified. We will not use targeted advertising to minors.'],
];

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  return <div className="page-wrap">
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="Skintel home">skintel<span>✳</span></Link>
      <nav className="desktop-nav" aria-label="Main navigation"><a href="#about">Our story</a><a href="#tools">The Skintel way</a><a href="#questions">Good to know</a></nav>
      <div className="header-actions">{user ? null : <Link className="text-link" to="/auth">Sign in</Link>}<Button variant="hero" className="nav-cta" asChild><Link to="/studio">Meet your skin <ArrowUpRight /></Link></Button><Button variant="ghost" size="icon" className="menu-control" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button></div>
    </header>
    {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{[['Our story', '#about'], ['The Skintel way', '#tools'], ['Good to know', '#questions']].map(([name, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{name}</a>)}</nav>}
    <main>
      <section className="hero" aria-labelledby="hero-heading">
        <img className="hero-image" src={heroImage} alt="Young Indian woman enjoying a simple moment of skincare" width={1536} height={1024} fetchPriority="high" />
        <div className="hero-content"><div className="eyebrow"><span>✳</span> A little science. A lot of you.</div><h1 id="hero-heading">SKINTEL</h1><h2 className="hero-tagline">Skincare that <br />gets <em>you.</em></h2><p className="hero-description">Your age. Your skin. Your budget.<br />Ingredient intelligence that starts with you,<br className="hidden md:block" /> not just what’s in the bottle.</p><Button variant="hero" className="hero-cta" asChild><Link to="/studio">Find your skin sense <ArrowUpRight /></Link></Button></div>
        <div className="hero-note"><ShieldCheck size={13} /> Thoughtfully built for Indian teens</div><Sparkles className="sparkle" strokeWidth={1} /><div className="hero-caption"><Sun size={14} /> Less noise. More you.</div>
      </section>
      <div className="values-strip"><span><ScanLine /> Ingredients, made understandable</span><span><Heart /> Your skin, not a score</span><span><Leaf /> Indian brands. Your real budget.</span><span><ShieldCheck /> Age-aware by design</span></div>
      <section id="about" className="about-section">
        <div className="section-topline"><span>01 / A fresh perspective</span><span>Skin first. Always.</span></div>
        <div className="about-grid"><div><h2 className="editorial-title">Your skin isn’t a trend.<br />It’s <em>personal.</em></h2><p className="about-text">A serum goes viral. It’s on your shelf tomorrow. But did anyone ask if your skin actually needs it?<br /><br />We’re changing the question. Not “is this clean?” or “is this toxic?” — but “is this right for <em>you</em>?” Meet a little more understanding, and a lot less guesswork.</p><a className="text-link" href="#tools">Get to know Skintel <ArrowUpRight size={16} /></a></div><img className="about-photo" src={productImage} alt="A simple skincare shelf of cleanser, moisturiser, and serum in fresh green light" loading="lazy" width={1200} height={800} /></div>
      </section>
      <section id="tools" className="tools-section"><div className="section-topline"><span>02 / Your new skin sense</span><span>Simple, not simplistic</span></div><div className="section-heading"><h2 className="editorial-title">Good skin decisions.<br /><em>Minus the overthinking.</em></h2><p>A little clarity for every label, every step,<br />and every “should I?”</p></div><div className="tools-grid">{tools.map(({ icon: Icon, title, text }, i) => <article className="tool-item" key={title}><div className="tool-icon"><Icon /><span className="tool-number">0{i + 1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="orange-band"><Flower2 className="band-flower" /><Flower2 className="band-flower right" /><div className="eyebrow">✳ Your shelf could use a little clarity</div><h2>LESS HYPE.<br />MORE SKIN SENSE.</h2><p>Good skincare isn’t about having more.<br />It’s about knowing what’s right for you.</p><Button variant="pale" className="hero-cta" asChild><Link to="/studio">Meet your simpler routine <ArrowUpRight /></Link></Button></section>
      <section className="brands-section"><p>Made for the brands on your shelf — not just overseas</p><div className="brand-list"><span>Minimalist.</span><span className="plum">plum</span><span className="derma">The Derma Co.</span><span>mamaearth</span><span className="text-muted-foreground text-xs font-normal">& your next discovery <ArrowRight className="inline ml-1" size={13} /></span></div></section>
      <section id="questions" className="faq-section"><div className="faq-intro"><div className="eyebrow">03 / A little transparency</div><h2 className="editorial-title">Glad you<br /><em>asked.</em></h2></div><div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<Plus /></summary><p>{answer}</p></details>)}</div></section>
    </main>
    <footer className="site-footer"><div className="footer-top"><a className="wordmark" href="#" aria-label="Skintel home">skintel<span>✳</span></a><p>Skincare intelligence.<br />A little wiser. A little more you.</p></div><div className="footer-bottom"><span>© 2026 Skintel. Made with care, for India.</span><span className="flex items-center gap-1"><Check size={11} /> Pre-launch · Educational guidance, not medical advice.</span></div></footer>
  </div>;
}
