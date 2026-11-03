import { Check, ChevronDown, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { Option } from "../lib/questionnaire";

interface BaseProps {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  number?: number;
}
export function FieldMessage({
  name,
  error,
  hint,
}: {
  name: string;
  error?: string;
  hint?: string;
}) {
  return (
    <>
      {hint && (
        <p className="field-hint" id={`${name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${name}-error`} role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </>
  );
}
interface TextFieldProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  autoFocus?: boolean;
}
export function TextField({
  name,
  label,
  hint,
  error,
  optional,
  number,
  value,
  onChange,
  placeholder,
  maxLength = 120,
  multiline,
  autoFocus,
}: TextFieldProps) {
  const describedBy =
    [hint ? `${name}-hint` : "", error ? `${name}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div
      className={`form-field ${error ? "has-error" : ""}`}
      id={`field-${name}`}
    >
      <label className="field-label" htmlFor={name}>
        {number && (
          <span className="question-number">
            {String(number).padStart(2, "0")}
          </span>
        )}
        <span>{label}</span>
        {optional ? (
          <span className="optional-label">Optional</span>
        ) : (
          <span className="required-mark" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <FieldMessage name={name} error={error} hint={hint} />
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-required={!optional}
        />
      ) : (
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete="off"
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-required={!optional}
        />
      )}
      {multiline && (
        <span className="character-count">
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      )}
    </div>
  );
}
interface SelectProps extends BaseProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
}
export function SelectField({
  name,
  label,
  error,
  hint,
  number,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: SelectProps) {
  return (
    <div
      className={`form-field ${error ? "has-error" : ""}`}
      id={`field-${name}`}
    >
      <label className="field-label" htmlFor={name}>
        {number && (
          <span className="question-number">
            {String(number).padStart(2, "0")}
          </span>
        )}
        <span>{label}</span>
        <span className="required-mark" aria-hidden="true">
          *
        </span>
      </label>
      <FieldMessage name={name} error={error} hint={hint} />
      <div className="select-wrap">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-required="true"
          aria-describedby={
            [hint ? `${name}-hint` : "", error ? `${name}-error` : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={17} aria-hidden="true" />
      </div>
    </div>
  );
}
interface ChoiceProps extends BaseProps {
  options: Option[];
  value: string | string[];
  onChange: (value: string) => void;
  multiple?: boolean;
  columns?: number;
  compact?: boolean;
}
export function ChoiceField({
  name,
  label,
  hint,
  error,
  number,
  options,
  value,
  onChange,
  multiple,
  columns = 2,
  compact,
}: ChoiceProps) {
  const selected = Array.isArray(value) ? value : [value];
  return (
    <fieldset
      className={`form-field choice-field ${error ? "has-error" : ""}`}
      id={`field-${name}`}
      aria-describedby={
        [hint ? `${name}-hint` : "", error ? `${name}-error` : ""]
          .filter(Boolean)
          .join(" ") || undefined
      }
      aria-invalid={!!error}
    >
      <legend className="field-label">
        {number && (
          <span className="question-number">
            {String(number).padStart(2, "0")}
          </span>
        )}
        <span>{label}</span>
        <span className="required-mark" aria-hidden="true">
          *
        </span>
        <span className="sr-only">(required)</span>
      </legend>
      <FieldMessage name={name} error={error} hint={hint} />
      <div
        className={`choice-grid ${compact ? "choice-grid-compact" : ""} columns-${columns}`}
      >
        {options.map((option, index) => {
          const checked = selected.includes(option.value);
          const id = `${name}-${index}`;
          return (
            <label
              className={`choice ${checked ? "is-selected" : ""} ${option.value.startsWith("We do not") || option.value.startsWith("No approval") || option.value === "Not currently planned" ? "choice-wide" : ""}`}
              htmlFor={id}
              key={option.value}
            >
              <input
                className="choice-input"
                type={multiple ? "checkbox" : "radio"}
                id={id}
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              <span
                className={`choice-control ${multiple ? "is-checkbox" : ""}`}
                aria-hidden="true"
              >
                {checked &&
                  (multiple ? <Check size={12} strokeWidth={3} /> : <span />)}
              </span>
              <span className="choice-text">
                <span>{option.label}</span>
                {option.description && <small>{option.description}</small>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
export function Conditional({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`conditional-wrap ${show ? "is-open" : ""}`}
      aria-hidden={!show}
      inert={!show}
    >
      <div className="conditional-inner">
        <div className="conditional-content">{children}</div>
      </div>
    </div>
  );
}
