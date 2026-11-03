import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileCheck2,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound,
  ScanEye,
  FileText,
  MousePointer2,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import { BrandMark } from "./Brand";

interface Props {
  onBuild: () => void;
  onPrivacy: () => void;
}
const benefits = [
  {
    icon: ShieldCheck,
    title: "Protect Business Information",
    text: "Set boundaries around the information employees can share with AI tools.",
    className: "benefit-shield",
  },
  {
    icon: Sparkles,
    title: "Encourage Responsible AI Use",
    text: "Help employees understand how to use AI appropriately at work.",
    className: "benefit-spark",
  },
  {
    icon: Fingerprint,
    title: "Reduce Security and Privacy Risks",
    text: "Establish safeguards for sensitive business and customer information.",
    className: "benefit-finger",
  },
  {
    icon: UsersRound,
    title: "Establish Accountability",
    text: "Define employee responsibilities when using AI-generated content and tools.",
    className: "benefit-users",
  },
];

export default function Landing({ onBuild, onPrivacy }: Props) {
  return (
    <main id="main-content" className="landing" tabIndex={-1}>
      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" /> CLEAR EXPECTATIONS. CONFIDENT
            TEAMS.
          </div>
          <h1 id="hero-title">
            Give Your Team
            <br />
            Clear Rules for
            <br />
            <span>Using AI.</span>
          </h1>
          <p className="hero-description">
            AI tools can make work faster and easier, but without clear
            guidelines, employees could unintentionally expose sensitive
            business information, compromise customer privacy or rely on
            inaccurate outputs.
          </p>
          <p className="hero-description hero-description-secondary">
            Create a practical AI Usage Policy for your business in a few simple
            steps.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary button-large"
              onClick={onBuild}
            >
              Build My AI Policy <ArrowRight size={18} />
            </button>
            <span className="free-note">
              <Check size={14} /> Free. No sign-up.
            </span>
          </div>
          <button className="hero-privacy" onClick={onPrivacy}>
            <LockKeyhole size={13} /> Your answers stay in your browser{" "}
            <ArrowUpRight size={12} />
          </button>
        </div>
        <div
          className="hero-art"
          aria-label="Interconnected ivory and blue ribbons representing clear, connected AI practices"
          role="img"
        >
          <div className="art-grid" aria-hidden="true" />
          <div className="art-top-label">
            <span className="tiny-cross">+</span> INTELLIGENCE, WITH DIRECTION
          </div>
          <img
            src="/images/clarity-sculpture.webp"
            alt=""
            width="1024"
            height="1024"
            fetchPriority="high"
            className="sculpture"
          />
          <div className="art-caption">
            <span className="caption-icon">
              <FileCheck2 size={21} strokeWidth={1.5} />
            </span>
            <div>
              <strong>Built around your business.</strong>
              <span>Not a one-size-fits-all template.</span>
            </div>
            <span className="caption-check">
              <Check size={13} />
            </span>
          </div>
          <div className="art-bottom-label">
            <span>01 — A CLEARER WAY FORWARD</span>
            <span className="tiny-cross">+</span>
          </div>
        </div>
      </section>

      <div className="trust-strip container">
        <span className="trust-intro">A LITTLE CLARITY GOES A LONG WAY.</span>
        <div>
          <ShieldCheck size={17} strokeWidth={1.5} />
          <span>Privacy-first by design</span>
        </div>
        <div>
          <SlidersHorizontal size={17} strokeWidth={1.5} />
          <span>Tailored to your business</span>
        </div>
        <div>
          <FileText size={17} strokeWidth={1.5} />
          <span>Ready to edit & download</span>
        </div>
      </div>

      <section
        id="about"
        className="benefits-section container section-anchor"
        aria-labelledby="benefits-heading"
      >
        <div className="benefits-intro reveal">
          <p className="eyebrow">
            <span className="eyebrow-line" /> THE VALUE OF CLEAR BOUNDARIES
          </p>
          <h2 id="benefits-heading">
            Why Your Business Needs an AI Usage Policy
          </h2>
          <p>
            AI is moving fast. Your team shouldn’t have to guess what’s okay.
          </p>
          <p>
            Turn everyday questions into shared expectations—with a practical
            policy that puts your people and your business first.
          </p>
          <div className="editorial-note">
            <BrandMark />
            <span>
              Responsible AI starts with
              <br />
              <strong>a little human clarity.</strong>
            </span>
          </div>
        </div>
        <div className="benefits-grid">
          {benefits.map(({ icon: Icon, title, text, className }, index) => (
            <article className={`benefit reveal ${className}`} key={title}>
              <div className="benefit-top">
                <span className="benefit-icon">
                  <Icon size={23} strokeWidth={1.45} />
                </span>
                <span className="benefit-number">0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="how-section section-anchor"
        aria-labelledby="how-heading"
      >
        <div className="container">
          <div className="how-heading reveal">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" /> FROM QUESTIONS TO CLARITY
              </p>
              <h2 id="how-heading">Create Your Policy in Three Steps</h2>
            </div>
            <p>
              No blank page. No complicated process.
              <br />
              Just a clearer way to use AI.
            </p>
          </div>
          <div className="steps-progression">
            <article className="how-step reveal">
              <div className="step-track">
                <span>01</span>
                <MousePointer2 size={19} strokeWidth={1.5} />
              </div>
              <h3>Tell us about your business.</h3>
              <p>
                A few essentials about your industry, team and where you
                operate.
              </p>
            </article>
            <article className="how-step reveal">
              <div className="step-track">
                <span>02</span>
                <ScanEye size={20} strokeWidth={1.5} />
              </div>
              <h3>Answer questions about how your team uses AI.</h3>
              <p>
                Choose the tools, boundaries and responsibilities that fit your
                business.
              </p>
            </article>
            <article className="how-step reveal">
              <div className="step-track">
                <span>03</span>
                <Download size={19} strokeWidth={1.5} />
              </div>
              <h3>Generate, customise and download your policy.</h3>
              <p>
                Make it yours, then save a professional PDF to share with your
                team.
              </p>
            </article>
          </div>
          <div className="how-bottom reveal">
            <button className="button button-primary" onClick={onBuild}>
              Create My Policy <ArrowRight size={17} />
            </button>
            <span>
              <LockKeyhole size={13} /> No account. No cost. No data sent.
            </span>
          </div>
        </div>
      </section>
      <section
        className="closing-note container reveal"
        aria-label="A useful starting point"
      >
        <span className="closing-mark">
          <BrandMark />
        </span>
        <p>
          A thoughtful starting point.
          <br />
          <strong>A more confident team.</strong>
        </p>
        <div>
          Made to be reviewed, adapted and put to work.
          <br />
          <span>Your business is unique. Your policy should be, too.</span>
        </div>
      </section>
    </main>
  );
}
