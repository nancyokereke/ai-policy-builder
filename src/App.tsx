import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleAlert,
  LockKeyhole,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import Brand from "./components/Brand";
import Landing from "./components/Landing";
import Footer from "./components/Footer";
import Questionnaire from "./components/Questionnaire";
import Results from "./components/Results";
import Modal from "./components/Modal";
import { emptyAnswers, DISCLAIMER } from "./lib/types";
import type { Answers, PolicyDocument, View } from "./lib/types";
import { scrollBehavior } from "./lib/motion";
import { generatePolicy } from "./lib/policy-engine";
import { validateAll, validateStage } from "./lib/questionnaire";
import { copyPolicy, downloadPolicyPdf } from "./lib/export-policy";

type Dialog = "privacy" | "disclaimer" | "reset" | "regenerate" | null;
const viewFromHash = (): View =>
  window.location.hash === "#builder" || window.location.hash === "#results"
    ? "builder"
    : "home";

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [step, setStep] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const [policy, setPolicy] = useState<PolicyDocument | null>(null);
  const [answersDirty, setAnswersDirty] = useState(false);
  const [manualEdits, setManualEdits] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    error?: boolean;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const policyRef = useRef(policy);
  policyRef.current = policy;

  const notify = useCallback((message: string, error = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, error });
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const navigate = useCallback((target: View, anchor?: string) => {
    setView(target);
    setMenuOpen(false);
    const hash = anchor
      ? `#${anchor}`
      : target === "home"
        ? "#home"
        : `#${target}`;
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    requestAnimationFrame(() => {
      if (anchor)
        document
          .getElementById(anchor)
          ?.scrollIntoView({ behavior: scrollBehavior() });
      else {
        window.scrollTo({ top: 0, behavior: "instant" });
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }
    });
  }, []);

  useEffect(() => {
    const handleLocation = () => {
      const hash = window.location.hash;
      setMenuOpen(false);
      if (hash === "#builder" || hash === "#results") {
        setView(
          hash === "#results" && policyRef.current
            ? "results"
            : hash === "#results"
              ? "builder"
              : "builder",
        );
        window.scrollTo({ top: 0, behavior: "instant" });
      } else {
        setView("home");
        requestAnimationFrame(() => {
          if (hash === "#about" || hash === "#how-it-works")
            document
              .getElementById(hash.slice(1))
              ?.scrollIntoView({ behavior: "instant" });
          else window.scrollTo({ top: 0, behavior: "instant" });
        });
      }
    };
    window.addEventListener("popstate", handleLocation);
    window.addEventListener("hashchange", handleLocation);
    return () => {
      window.removeEventListener("popstate", handleLocation);
      window.removeEventListener("hashchange", handleLocation);
    };
  }, []);

  useEffect(() => {
    document.title =
      view === "builder"
        ? "Build Your AI Policy — AI Policy Builder"
        : view === "results" && policy
          ? `${policy.businessName} AI Usage Policy — AI Policy Builder`
          : "AI Policy Builder — Clear rules. Confident teams.";
  }, [view, policy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.1 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (generationTimer.current) clearTimeout(generationTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  function changeAnswers(next: Answers) {
    setAnswers(next);
    if (policy) setAnswersDirty(true);
  }
  function startGeneration() {
    const errors = validateAll(answers);
    if (Object.keys(errors).length) {
      setStep(
        [0, 1, 2, 3].find(
          (s) => Object.keys(validateStage(s, answers)).length > 0,
        ) ?? 0,
      );
      notify("Please complete the required answers before generating.", true);
      return;
    }
    setGenerating(true);
    generationTimer.current = setTimeout(
      () => {
        try {
          const generated = generatePolicy(answers);
          setPolicy(generated);
          policyRef.current = generated;
          setAnswersDirty(false);
          setManualEdits(false);
          setCopied(false);
          navigate("results");
        } catch {
          notify(
            "We couldn’t create this policy. Please check your answers and try again.",
            true,
          );
        } finally {
          setGenerating(false);
        }
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450,
    );
  }
  function requestGeneration() {
    if (policy && manualEdits) setDialog("regenerate");
    else startGeneration();
  }
  function reset() {
    if (generationTimer.current) clearTimeout(generationTimer.current);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setAnswers(emptyAnswers());
    setPolicy(null);
    policyRef.current = null;
    setStep(0);
    setSessionKey((k) => k + 1);
    setAnswersDirty(false);
    setManualEdits(false);
    setCopied(false);
    setGenerating(false);
    setDialog(null);
    setToast(null);
    navigate("builder");
  }
  async function handleCopy() {
    if (!policy || copying) return;
    setCopying(true);
    try {
      await copyPolicy(policy);
      setCopied(true);
      notify("Policy copied to your clipboard.");
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 3500);
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Couldn’t copy the policy. Please try again.",
        true,
      );
    } finally {
      setCopying(false);
    }
  }
  async function handleDownload() {
    if (!policy || downloading) return;
    setDownloading(true);
    try {
      await downloadPolicyPdf(policy);
      notify("Your PDF is ready. Check your browser’s downloads.");
    } catch {
      notify(
        "The PDF couldn’t be prepared. Please try downloading again.",
        true,
      );
    } finally {
      setDownloading(false);
    }
  }
  const goHome = () => navigate("home");
  const goBuilder = () => navigate("builder");
  const goAbout = () => navigate("home", "about");
  const openPrivacy = () => setDialog("privacy");
  const editAnswers = () => {
    setStep(0);
    setSessionKey((k) => k + 1);
    goBuilder();
  };

  return (
    <div className={`app view-${view}`}>
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus({ preventScroll: true });
          main?.scrollIntoView({ behavior: "instant", block: "start" });
        }}
      >
        Skip to main content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <Brand onClick={goHome} />
          {view === "home" ? (
            <>
              <nav
                className={`main-nav ${menuOpen ? "is-open" : ""}`}
                id="main-navigation"
                aria-label="Main navigation"
              >
                <button onClick={goAbout}>About</button>
                <button onClick={() => navigate("home", "how-it-works")}>
                  How It Works
                </button>
                <button
                  className="button button-primary nav-mobile-cta"
                  onClick={goBuilder}
                >
                  Build My AI Policy <ArrowRight size={15} />
                </button>
              </nav>
              <div className="header-actions">
                <button
                  className="button button-primary nav-cta"
                  onClick={goBuilder}
                >
                  Build My AI Policy <ArrowRight size={15} />
                </button>
                <button
                  className="icon-button mobile-menu-button"
                  aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                  aria-expanded={menuOpen}
                  aria-controls="main-navigation"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
              </div>
            </>
          ) : (
            <div className="header-workspace-label">
              <LockKeyhole size={13} />
              <span>Your private policy workspace</span>
              <span className="header-free">FREE TOOL</span>
            </div>
          )}
        </div>
      </header>

      {view === "home" && (
        <Landing onBuild={goBuilder} onPrivacy={openPrivacy} />
      )}
      {view === "builder" && (
        <Questionnaire
          key={sessionKey}
          answers={answers}
          onChange={changeAnswers}
          step={step}
          onStep={setStep}
          onGenerate={requestGeneration}
          onHome={goHome}
          onPrivacy={openPrivacy}
          onResults={() => navigate("results")}
          generating={generating}
          existingPolicy={policy}
          answersDirty={answersDirty}
        />
      )}
      {view === "results" && policy && (
        <Results
          policy={policy}
          onChange={(next) => {
            setPolicy(next);
            setManualEdits(true);
            setCopied(false);
          }}
          onEditAnswers={editAnswers}
          onStartAgain={() => setDialog("reset")}
          onCopy={handleCopy}
          onDownload={handleDownload}
          copying={copying}
          copied={copied}
          downloading={downloading}
          answersDirty={answersDirty}
          onPrivacy={openPrivacy}
        />
      )}

      <Footer
        onHome={goHome}
        onAbout={goAbout}
        onPrivacy={openPrivacy}
        onDisclaimer={() => setDialog("disclaimer")}
      />
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className={`toast ${toast.error ? "toast-error" : ""}`}>
            {toast.error ? <CircleAlert size={18} /> : <Check size={18} />}
            <span>{toast.message}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>

      {dialog === "privacy" && (
        <Modal
          title="Your business stays your business."
          eyebrow="PRIVACY NOTICE"
          onClose={() => setDialog(null)}
        >
          <div className="modal-feature-icon">
            <ShieldCheck size={26} strokeWidth={1.5} />
          </div>
          <p>
            AI Policy Builder is designed to be useful without asking for your
            personal information.
          </p>
          <ul className="privacy-list">
            <li>
              <Check size={16} />
              <span>
                <strong>No contact details.</strong> We do not request your
                name, email address, phone number or other personal contact
                information. Business information is used only to prepare your
                document.
              </span>
            </li>
            <li>
              <Check size={16} />
              <span>
                <strong>Processed in your browser.</strong> Your questionnaire
                responses and policy edits are processed locally on your device.
                No backend, database or external AI service is involved.
              </span>
            </li>
            <li>
              <Check size={16} />
              <span>
                <strong>Not stored or transmitted.</strong> Responses are not
                stored in a database or sent to external AI services. This tool
                keeps your work in memory only, with no analytics or advertising
                trackers.
              </span>
            </li>
            <li>
              <Check size={16} />
              <span>
                <strong>Download before you leave.</strong> Your answers,
                generated policy and edits may be lost when you refresh or close
                the page. Save a PDF or copy your policy first.
              </span>
            </li>
          </ul>
          <p className="modal-small">
            Fonts and visual assets are served with this website. Opening
            “Connect with Nancy” takes you to LinkedIn, an external site with
            its own privacy practices. Your questionnaire is never included in
            that link.
          </p>
          <button
            className="button button-primary modal-done"
            onClick={() => setDialog(null)}
          >
            Got it <Check size={16} />
          </button>
        </Modal>
      )}
      {dialog === "disclaimer" && (
        <Modal
          title="A starting point, not legal advice."
          eyebrow="A NOTE BEFORE YOU ADOPT"
          onClose={() => setDialog(null)}
        >
          <p className="disclaimer-quote">{DISCLAIMER}</p>
          <div className="inline-notice">
            <InfoIcon />
            <p>
              Look for bracketed placeholders in your generated policy. Confirm
              the relevant owners, tools and processes, then review the complete
              document before sharing it with your team.
            </p>
          </div>
          <button
            className="button button-primary modal-done"
            onClick={() => setDialog(null)}
          >
            Understood <Check size={16} />
          </button>
        </Modal>
      )}
      {dialog === "reset" && (
        <Modal
          title="Start with a clean slate?"
          eyebrow="START AGAIN"
          onClose={() => setDialog(null)}
        >
          <p>
            This clears your questionnaire answers, generated policy and any
            document edits in this tab. Download or copy your current policy
            first if you want to keep it.
          </p>
          <div className="modal-actions">
            <button
              className="button button-secondary"
              onClick={() => setDialog(null)}
            >
              Keep My Policy
            </button>
            <button className="button button-primary" onClick={reset}>
              Start Again <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
      {dialog === "regenerate" && (
        <Modal
          title="Create a fresh policy?"
          eyebrow="YOUR DOCUMENT HAS MANUAL EDITS"
          onClose={() => setDialog(null)}
        >
          <p>
            Generating again will use your current questionnaire answers and
            replace manual edits to the document. Copy or download the current
            version first if you’d like to keep those changes.
          </p>
          <div className="modal-actions">
            <button
              className="button button-secondary"
              onClick={() => setDialog(null)}
            >
              Keep Editing
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setDialog(null);
                startGeneration();
              }}
            >
              Generate New Policy <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function InfoIcon() {
  return <CircleAlert size={18} />;
}
