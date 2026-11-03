import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  FileCheck2,
  Info,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import type { Answers, AnswerKey, Errors, PolicyDocument } from "../lib/types";
import { scrollBehavior } from "../lib/motion";
import {
  STAGES,
  INDUSTRIES,
  SIZES,
  USES,
  TOOLS,
  ACCESS,
  PROTECTED_DATA,
  UPLOADS,
  APPROVERS,
  CONNECTIONS,
  REVIEWS,
  OVERSIGHT,
  DISCLOSURE,
  INCIDENTS,
  TRAINING,
  FREQUENCIES,
  NO_TOOLS,
  validateStage,
  hasNoTools,
  toggleSelection,
} from "../lib/questionnaire";
import { ChoiceField, Conditional, SelectField, TextField } from "./Fields";

interface Props {
  answers: Answers;
  onChange: (answers: Answers) => void;
  step: number;
  onStep: (step: number) => void;
  onGenerate: () => void;
  onHome: () => void;
  onPrivacy: () => void;
  onResults: () => void;
  generating: boolean;
  existingPolicy: PolicyDocument | null;
  answersDirty: boolean;
}
const stageIcons = [Building2, Sparkles, ShieldCheck, UsersRound];

export default function Questionnaire({
  answers: a,
  onChange,
  step,
  onStep,
  onGenerate,
  onHome,
  onPrivacy,
  onResults,
  generating,
  existingPolicy,
  answersDirty,
}: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const [furthest, setFurthest] = useState(existingPolicy ? 3 : step);
  const topRef = useRef<HTMLDivElement>(null);
  const stage = STAGES[step];
  const noTools = hasNoTools(a);

  function update<K extends AnswerKey>(key: K, value: Answers[K]) {
    onChange({ ...a, [key]: value });
    if (errors[key])
      setErrors((previous) => ({ ...previous, [key]: undefined }));
  }
  const textProps = (
    key:
      | "businessName"
      | "industryOther"
      | "country"
      | "usesOther"
      | "toolsOther"
      | "protectedDataOther"
      | "oversightOther"
      | "additionalRules",
  ) => ({
    name: key,
    value: a[key],
    error: errors[key],
    onChange: (value: string) => update(key, value),
  });
  const choiceProps = (
    key:
      | "industry"
      | "businessSize"
      | "access"
      | "uploads"
      | "approver"
      | "connections"
      | "review"
      | "disclosure"
      | "incidents"
      | "training"
      | "reviewFrequency",
  ) => ({
    name: key,
    value: a[key],
    error: errors[key],
    onChange: (value: string) => update(key, value),
  });
  const multiProps = (
    key: "uses" | "tools" | "protectedData" | "oversight",
  ) => ({
    name: key,
    value: a[key],
    error: errors[key],
    multiple: true,
    onChange: (value: string) =>
      update(
        key,
        toggleSelection(a[key], value, key === "tools" ? NO_TOOLS : undefined),
      ),
  });
  function moveTo(next: number) {
    setErrors({});
    onStep(next);
    setFurthest((previous) => Math.max(previous, next));
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      topRef.current?.focus({ preventScroll: true });
    });
  }
  function next() {
    const validation = validateStage(step, a);
    setErrors(validation);
    if (Object.keys(validation).length) {
      requestAnimationFrame(() => {
        const first = Object.keys(validation)[0];
        const field = document.getElementById(`field-${first}`);
        field?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
        field
          ?.querySelector<HTMLElement>("input, select, textarea")
          ?.focus({ preventScroll: true });
      });
      return;
    }
    if (step < 3) moveTo(step + 1);
    else onGenerate();
  }
  function jumpTo(target: number) {
    if (target <= step || target <= furthest) {
      if (target > step) {
        for (let s = 0; s < target; s++) {
          const issues = validateStage(s, a);
          if (Object.keys(issues).length) {
            onStep(s);
            setErrors(issues);
            return;
          }
        }
      }
      moveTo(target);
    }
  }

  return (
    <main id="main-content" className="builder-page" tabIndex={-1}>
      <div className="container">
        <div className="builder-topline">
          <button className="text-button" onClick={onHome}>
            <ChevronLeft size={15} /> Back to home
          </button>
          <span>
            <LockKeyhole size={13} /> Private, browser-only workspace
          </span>
        </div>
        <div className="builder-intro">
          <p className="eyebrow">
            <span className="eyebrow-line" /> YOUR BUSINESS. YOUR POLICY.
          </p>
          <h1>Let’s make the ground rules clear.</h1>
          <p>
            A few thoughtful questions. A policy that reflects how your business
            works.
          </p>
        </div>
        {existingPolicy && (
          <div className="existing-policy-note">
            <FileCheck2 size={18} />
            <span>
              {answersDirty
                ? "Your answers have changed. Generate again to update your policy."
                : "Your generated policy is still here. You can return without losing your edits."}
            </span>
            <button onClick={onResults}>
              View current policy <ArrowRight size={14} />
            </button>
          </div>
        )}
        <div
          className="builder-layout"
          ref={topRef}
          tabIndex={-1}
          id="questionnaire-top"
        >
          <aside
            className="builder-sidebar"
            aria-label="Questionnaire progress"
          >
            <span className="sidebar-label">YOUR PROGRESS</span>
            <nav className="stage-nav" aria-label="Questionnaire sections">
              {STAGES.map((s, index) => {
                const Icon = stageIcons[index];
                const completed = index < step;
                return (
                  <button
                    key={s.title}
                    className={`stage-link ${index === step ? "active" : ""} ${completed ? "completed" : ""}`}
                    onClick={() => jumpTo(index)}
                    disabled={index > furthest || generating}
                    aria-current={index === step ? "step" : undefined}
                  >
                    <span className="stage-number">
                      {completed ? (
                        <Check size={15} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <span>
                      <strong>{s.short}</strong>
                      <small>
                        {index === step
                          ? "You’re here"
                          : completed
                            ? "Completed"
                            : `Section ${index + 1}`}
                      </small>
                    </span>
                    <Icon className="stage-icon" size={17} strokeWidth={1.5} />
                  </button>
                );
              })}
            </nav>
            <div className="sidebar-privacy">
              <span className="privacy-icon">
                <ShieldCheck size={22} strokeWidth={1.5} />
              </span>
              <h3>Your business stays your business.</h3>
              <p>
                Your answers are processed only in this browser. No account, no
                database, no AI service.
              </p>
              <button className="text-button" onClick={onPrivacy}>
                Our privacy promise <ArrowRight size={13} />
              </button>
            </div>
            <p className="sidebar-session">
              <Info size={14} />
              <span>
                Download your policy before refreshing or closing this page.
              </span>
            </p>
          </aside>
          <div className="questionnaire-workspace">
            <div className="workspace-progress">
              <div>
                <span>
                  SECTION {String(step + 1).padStart(2, "0")}{" "}
                  <span className="muted">OF 04</span>
                </span>
                <span>{(step + 1) * 25}% complete</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-label="Questionnaire section progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={(step + 1) * 25}
                aria-valuetext={`Section ${step + 1} of 4`}
              >
                <span style={{ width: `${(step + 1) * 25}%` }} />
              </div>
            </div>
            <form
              className="questionnaire-form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              aria-busy={generating}
            >
              <div className="section-heading" key={`heading-${step}`}>
                <span className="section-icon">
                  {step === 0 ? (
                    <Building2 size={23} strokeWidth={1.4} />
                  ) : step === 1 ? (
                    <Sparkles size={23} strokeWidth={1.4} />
                  ) : step === 2 ? (
                    <ShieldCheck size={23} strokeWidth={1.4} />
                  ) : (
                    <UsersRound size={23} strokeWidth={1.4} />
                  )}
                </span>
                <h2>{stage.title}</h2>
                <p>{stage.description}</p>
              </div>
              {Object.values(errors).some(Boolean) && (
                <div className="validation-summary" role="alert">
                  <Info size={17} />
                  <span>
                    Please check the highlighted fields below before continuing.
                  </span>
                </div>
              )}
              <div className="stage-fields" key={step}>
                {step === 0 && (
                  <>
                    <TextField
                      {...textProps("businessName")}
                      number={1}
                      label="Business name"
                      placeholder="e.g. Northstar Studio"
                      hint="Use the name you’d like to appear on your policy."
                      maxLength={120}
                    />
                    <SelectField
                      {...choiceProps("industry")}
                      number={2}
                      label="Industry"
                      options={INDUSTRIES}
                      placeholder="Choose your industry"
                    />
                    <Conditional show={a.industry === "Other"}>
                      <TextField
                        {...textProps("industryOther")}
                        label="Your industry"
                        placeholder="Tell us the industry you work in"
                        maxLength={100}
                      />
                    </Conditional>
                    <ChoiceField
                      {...choiceProps("businessSize")}
                      number={3}
                      label="Business size"
                      hint="An approximate headcount is all we need."
                      options={SIZES}
                    />
                    <TextField
                      {...textProps("country")}
                      number={4}
                      label="Country of operation"
                      placeholder="e.g. Nigeria"
                      hint="Your primary country of operation. You can add jurisdiction-specific requirements later."
                      maxLength={100}
                    />
                  </>
                )}
                {step === 1 && (
                  <>
                    {noTools && (
                      <div className="inline-notice">
                        <Info size={18} />
                        <p>
                          You’re planning ahead. We’ll frame your policy around
                          future AI adoption, rather than suggesting that AI is
                          already in use.
                        </p>
                      </div>
                    )}
                    <ChoiceField
                      {...multiProps("uses")}
                      number={5}
                      label={
                        noTools
                          ? "What would your team like to use AI for?"
                          : "What does your team use AI for?"
                      }
                      hint="Select all that apply. These uses shape the guidance in your policy."
                      options={USES}
                      compact
                    />
                    <Conditional show={a.uses.includes("Other")}>
                      <TextField
                        {...textProps("usesOther")}
                        label="Other AI uses"
                        placeholder="e.g. Translating customer communications"
                        maxLength={200}
                      />
                    </Conditional>
                    <ChoiceField
                      {...multiProps("tools")}
                      number={6}
                      label="Which AI tools does your team currently use?"
                      hint="Select all that apply. Not using AI yet? Choose the last option."
                      options={TOOLS}
                      compact
                    />
                    <Conditional show={a.tools.includes("Other")}>
                      <TextField
                        {...textProps("toolsOther")}
                        label="Other AI tools"
                        placeholder="e.g. Jasper, GitHub Copilot"
                        maxLength={200}
                      />
                    </Conditional>
                    <Conditional show={!noTools}>
                      <ChoiceField
                        {...choiceProps("access")}
                        number={7}
                        label="How do employees access these tools?"
                        options={ACCESS}
                      />
                    </Conditional>
                  </>
                )}
                {step === 2 && (
                  <>
                    <ChoiceField
                      {...multiProps("protectedData")}
                      number={8}
                      label="What information should employees NOT enter into unapproved AI tools?"
                      hint="Select every category that applies. Core credential and confidentiality safeguards are also included."
                      options={PROTECTED_DATA}
                      compact
                    />
                    <Conditional show={a.protectedData.includes("Other")}>
                      <TextField
                        {...textProps("protectedDataOther")}
                        label="Other sensitive information"
                        placeholder="Describe the information you want to protect"
                        maxLength={200}
                      />
                    </Conditional>
                    <ChoiceField
                      {...choiceProps("uploads")}
                      number={9}
                      label="Should employees be allowed to upload company documents to AI tools?"
                      options={UPLOADS}
                    />
                    <ChoiceField
                      {...choiceProps("approver")}
                      number={10}
                      label="Who should approve the use of new AI tools in the business?"
                      options={APPROVERS}
                    />
                    <ChoiceField
                      {...choiceProps("connections")}
                      number={11}
                      label="Should employees be allowed to connect AI tools to company systems, applications or databases?"
                      options={CONNECTIONS}
                    />
                    {(a.uploads === "Not sure" ||
                      a.connections === "Not sure" ||
                      a.approver ===
                        "No approval process currently exists") && (
                      <div className="inline-notice">
                        <Info size={18} />
                        <p>
                          No problem. Your policy will use cautious interim
                          rules and complete proposed requirements where a
                          business decision is still needed.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {step === 3 && (
                  <>
                    <ChoiceField
                      {...choiceProps("review")}
                      number={12}
                      label="Should AI-generated work be reviewed by a human before use?"
                      options={REVIEWS}
                    />
                    <ChoiceField
                      {...multiProps("oversight")}
                      number={13}
                      label="Which activities should always require human oversight?"
                      hint="These activities always need a human, even if your general review rule is narrower."
                      options={OVERSIGHT}
                      compact
                    />
                    <Conditional show={a.oversight.includes("Other")}>
                      <TextField
                        {...textProps("oversightOther")}
                        label="Other activities requiring oversight"
                        placeholder="e.g. Supplier selection"
                        maxLength={200}
                      />
                    </Conditional>
                    <ChoiceField
                      {...choiceProps("disclosure")}
                      number={14}
                      label="Should employees disclose when content has been generated or substantially assisted by AI?"
                      options={DISCLOSURE}
                    />
                    <ChoiceField
                      {...choiceProps("incidents")}
                      number={15}
                      label="What should employees do if they accidentally share sensitive information with an AI tool or notice suspicious AI-related activity?"
                      options={INCIDENTS}
                      columns={1}
                    />
                    <ChoiceField
                      {...choiceProps("training")}
                      number={16}
                      label="Should employees receive training on responsible AI use?"
                      options={TRAINING}
                    />
                    <ChoiceField
                      {...choiceProps("reviewFrequency")}
                      number={17}
                      label="How often should this policy be reviewed?"
                      options={FREQUENCIES}
                    />
                    <TextField
                      {...textProps("additionalRules")}
                      number={18}
                      label="Are there any additional rules you want included?"
                      optional
                      multiline
                      placeholder="Add any business-specific rules, expectations or context you’d like your policy to include…"
                      maxLength={4000}
                    />
                  </>
                )}
              </div>
              <div className="questionnaire-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => (step === 0 ? onHome() : moveTo(step - 1))}
                  disabled={generating}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <span className="required-note">* Required fields</span>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <LoaderCircle className="spin" size={17} /> Creating your
                      policy…
                    </>
                  ) : step === 3 ? (
                    <>
                      Generate My AI Policy <Sparkles size={16} />
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
            <p className="workspace-footnote">
              <LockKeyhole size={12} /> Your responses are never sent to an
              external AI service.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
