import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Copy,
  Download,
  FileText,
  Info,
  List,
  LoaderCircle,
  PencilLine,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { PolicyDocument, PolicySection } from "../lib/types";
import { scrollBehavior } from "../lib/motion";
import { displayDate } from "../lib/export-policy";
import { reviewLabel } from "../lib/policy-engine";

function AutoTextarea({
  value,
  onChange,
  label,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    const resize = () => {
      if (element) {
        element.style.height = "0px";
        element.style.height = `${element.scrollHeight + 2}px`;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value]);
  return (
    <textarea
      ref={ref}
      className={`document-textarea ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      rows={1}
      spellCheck
    />
  );
}

interface Props {
  policy: PolicyDocument;
  onChange: (policy: PolicyDocument) => void;
  onEditAnswers: () => void;
  onStartAgain: () => void;
  onCopy: () => Promise<void>;
  onDownload: () => Promise<void>;
  copying: boolean;
  copied: boolean;
  downloading: boolean;
  answersDirty: boolean;
  onPrivacy: () => void;
}
export default function Results({
  policy,
  onChange,
  onEditAnswers,
  onStartAgain,
  onCopy,
  onDownload,
  copying,
  copied,
  downloading,
  answersDirty,
  onPrivacy,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState(policy.sections[0]?.id);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible[0])
          setActiveSection(visible[0].target.id.replace(/^policy-/, ""));
      },
      { rootMargin: "-190px 0px -55% 0px", threshold: 0 },
    );
    document
      .querySelectorAll(".policy-section")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [policy.sections.length]);
  function updateSection(id: string, update: Partial<PolicySection>) {
    onChange({
      ...policy,
      sections: policy.sections.map((section) =>
        section.id === id ? { ...section, ...update } : section,
      ),
    });
  }
  function toggleEditing() {
    setEditing(!editing);
    if (!editing)
      requestAnimationFrame(() =>
        document
          .querySelector<HTMLTextAreaElement>(".document-title-input")
          ?.focus({ preventScroll: true }),
      );
  }
  function jumpTo(id: string) {
    setActiveSection(id);
    document
      .getElementById(`policy-${id}`)
      ?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }

  return (
    <main id="main-content" className="results-page" tabIndex={-1}>
      <div className="container">
        <div className="results-intro">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" /> A CLEARER WAY FORWARD
            </p>
            <h1 ref={titleRef} tabIndex={-1}>
              Your policy is ready.
            </h1>
            <p>Thoughtfully structured. Yours to make your own.</p>
          </div>
          <span className="ready-badge">
            <CheckCheck size={16} /> Generated in your browser
          </span>
        </div>
        {answersDirty && (
          <div className="existing-policy-note stale-note">
            <Info size={18} />
            <span>
              Your questionnaire has changed. This document still reflects your
              previous answers.
            </span>
            <button onClick={onEditAnswers}>
              Review & regenerate <ArrowRight size={14} />
            </button>
          </div>
        )}
        <div className="results-toolbar" aria-label="Policy actions">
          <div className="toolbar-primary">
            <button
              className={`button ${editing ? "button-primary" : "button-secondary"}`}
              onClick={toggleEditing}
            >
              {editing ? <Check size={16} /> : <PencilLine size={16} />}
              {editing ? "Done Editing" : "Edit Policy"}
            </button>
            <button
              className="button button-secondary"
              onClick={() => void onCopy()}
              disabled={copying}
            >
              {copying ? (
                <LoaderCircle size={16} className="spin" />
              ) : copied ? (
                <Check size={16} />
              ) : (
                <Copy size={16} />
              )}
              {copied ? "Copied!" : copying ? "Copying…" : "Copy Policy"}
            </button>
            <button
              className="button button-primary"
              onClick={() => void onDownload()}
              disabled={downloading}
            >
              {downloading ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Download size={16} />
              )}
              {downloading ? "Preparing PDF…" : "Download PDF"}
            </button>
          </div>
          <div className="toolbar-secondary">
            <button className="text-button" onClick={onEditAnswers}>
              <ArrowLeft size={14} /> Edit My Answers
            </button>
            <button className="text-button muted" onClick={onStartAgain}>
              <RotateCcw size={14} /> Start Again
            </button>
          </div>
        </div>
        <div
          className={`editing-notice ${editing ? "visible" : ""}`}
          role="status"
        >
          {editing && (
            <>
              <PencilLine size={16} />
              <span>
                You’re editing the actual document. Every change is included in
                Copy Policy and Download PDF.
              </span>
            </>
          )}
        </div>
        <div className="results-layout">
          <aside className="document-sidebar">
            <div className="document-outline">
              <h2>
                <List size={15} /> IN THIS POLICY
              </h2>
              <nav aria-label="Policy contents">
                {policy.sections.map((section, index) => (
                  <button
                    key={section.id}
                    className={activeSection === section.id ? "active" : ""}
                    onClick={() => jumpTo(section.id)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
            <div className="document-save-note">
              <ShieldCheck size={21} strokeWidth={1.5} />
              <h3>A draft to make your own.</h3>
              <p>
                Review the tailored provisions and proposed arrangements, and
                seek appropriate professional advice before adopting it.
              </p>
              <button className="text-button" onClick={onPrivacy}>
                Your privacy matters <ArrowRight size={13} />
              </button>
            </div>
            <p className="document-session-note">
              <Info size={14} /> Your work lives in this tab. Download before
              closing or refreshing.
            </p>
          </aside>
          <div className="document-column">
            <div className="pre-document-note">
              <FileText size={15} />
              <span>
                Review the proposed requirements and recommendations before
                adoption.
              </span>
            </div>
            <article
              className={`policy-paper ${editing ? "is-editing" : ""}`}
              aria-label="Generated AI Usage Policy"
            >
              <header className="policy-document-header">
                <div className="document-brandline">
                  <span>AI POLICY BUILDER</span>
                  <span>WORKPLACE POLICY</span>
                </div>
                {editing ? (
                  <AutoTextarea
                    className="document-title-input"
                    label="Policy title"
                    value={policy.title}
                    onChange={(title) => onChange({ ...policy, title })}
                  />
                ) : (
                  <h2 className="document-title">{policy.title}</h2>
                )}
                <p className="document-subtitle">
                  A customised starting point for establishing responsible AI
                  practices in your business.
                </p>
                <dl className="policy-metadata">
                  <div>
                    <dt>BUSINESS</dt>
                    <dd>{policy.businessName}</dd>
                  </div>
                  <div>
                    <dt>INDUSTRY</dt>
                    <dd>{policy.industry}</dd>
                  </div>
                  <div>
                    <dt>COUNTRY</dt>
                    <dd>{policy.country}</dd>
                  </div>
                  <div>
                    <dt>EFFECTIVE DATE</dt>
                    <dd>{displayDate(policy.effectiveDate)}</dd>
                  </div>
                  <div className="metadata-review">
                    <dt>POLICY REVIEW</dt>
                    <dd>{reviewLabel(policy.reviewFrequency)}</dd>
                  </div>
                </dl>
              </header>
              <div className="policy-sections">
                {policy.sections.map((section, index) => (
                  <section
                    id={`policy-${section.id}`}
                    className="policy-section"
                    key={section.id}
                  >
                    <div className="policy-section-heading">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      {editing ? (
                        <AutoTextarea
                          className="section-title-input"
                          label={`Section ${index + 1} heading`}
                          value={section.title}
                          onChange={(title) =>
                            updateSection(section.id, { title })
                          }
                        />
                      ) : (
                        <h3>{section.title}</h3>
                      )}
                    </div>
                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <div className="policy-paragraph" key={paragraphIndex}>
                        {editing ? (
                          <>
                            <AutoTextarea
                              value={paragraph}
                              label={`${section.title}, paragraph ${paragraphIndex + 1}`}
                              onChange={(value) =>
                                updateSection(section.id, {
                                  paragraphs: section.paragraphs.map((p, i) =>
                                    i === paragraphIndex ? value : p,
                                  ),
                                })
                              }
                            />
                            <button
                              className="remove-paragraph"
                              aria-label={`Remove ${section.title}, paragraph ${paragraphIndex + 1}`}
                              title="Remove paragraph"
                              onClick={() =>
                                updateSection(section.id, {
                                  paragraphs: section.paragraphs.filter(
                                    (_, i) => i !== paragraphIndex,
                                  ),
                                })
                              }
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <p>{paragraph}</p>
                        )}
                      </div>
                    ))}
                    {editing && (
                      <button
                        className="add-paragraph text-button"
                        onClick={() =>
                          updateSection(section.id, {
                            paragraphs: [...section.paragraphs, ""],
                          })
                        }
                      >
                        <Plus size={13} /> Add paragraph
                      </button>
                    )}
                  </section>
                ))}
              </div>
              <section className="policy-disclaimer">
                <h3>Important notice</h3>
                <p>
                  {editing ? (
                    <AutoTextarea
                      value={policy.disclaimer}
                      label="Important notice"
                      onChange={(disclaimer) =>
                        onChange({ ...policy, disclaimer })
                      }
                    />
                  ) : (
                    policy.disclaimer
                  )}
                </p>
              </section>
              <div className="document-endmark">
                <span /> <FileText size={16} strokeWidth={1.4} /> <span />
              </div>
              <p className="document-attribution">
                Created using AI Policy Builder by Nancy Okereke.
              </p>
            </article>
            <div className="document-bottom-actions">
              <span>
                <Check size={15} /> Ready for your next step.
              </span>
              <button
                className="button button-primary"
                onClick={() => void onDownload()}
                disabled={downloading}
              >
                {downloading ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
                {downloading ? "Preparing PDF…" : "Download PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
