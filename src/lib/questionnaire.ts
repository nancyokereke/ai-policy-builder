import type { Answers, Errors } from "./types";

export interface Option {
  value: string;
  label: string;
  description?: string;
}
export const options = (labels: string[]): Option[] =>
  labels.map((label) => ({ value: label, label }));

export const INDUSTRIES = options([
  "Technology",
  "Financial Services",
  "Healthcare",
  "Education",
  "Retail and E-commerce",
  "Manufacturing",
  "Professional Services",
  "Media and Communications",
  "Hospitality",
  "Other",
]);
export const SIZES = options([
  "1–10 employees",
  "11–50 employees",
  "51–200 employees",
  "201–500 employees",
  "More than 500 employees",
]);
export const USES = options([
  "Writing and content creation",
  "Research and information gathering",
  "Marketing and advertising",
  "Customer support",
  "Data analysis",
  "Software development and coding",
  "Human resources and recruitment",
  "Summarising documents and reports",
  "Image and video generation",
  "Business planning and decision-making",
  "Workflow automation",
  "Other",
]);
export const NO_TOOLS = "We do not currently use AI tools";
export const TOOLS = options([
  "ChatGPT",
  "Google Gemini",
  "Microsoft Copilot",
  "Claude",
  "Perplexity",
  "Canva AI",
  "Adobe Firefly",
  "Other",
  NO_TOOLS,
]);
export const ACCESS = options([
  "Company-provided accounts",
  "Personal accounts",
  "A combination of both",
  "Not sure",
]);
export const PROTECTED_DATA = options([
  "Customer personal information",
  "Employee personal information",
  "Passwords and login credentials",
  "Financial records",
  "Confidential company documents",
  "Internal reports",
  "Business strategies and trade secrets",
  "Contracts and legal documents",
  "Source code and technical information",
  "Unreleased product or business information",
  "Other",
]);
export const UPLOADS: Option[] = [
  {
    value: "No",
    label: "No",
    description: "Company documents must not be uploaded.",
  },
  {
    value: "Yes, but only to approved AI tools",
    label: "Only to approved AI tools",
    description: "Uploads are limited to tools approved by the business.",
  },
  {
    value: "Yes, with prior management approval",
    label: "With management approval",
    description: "Employees need permission before each upload.",
  },
  {
    value: "Not sure",
    label: "Not sure yet",
    description: "Use a precautionary rule until a decision is made.",
  },
];
export const APPROVERS = options([
  "Management",
  "IT or cybersecurity team",
  "Data protection or compliance team",
  "Department heads",
  "A combination of these teams",
  "No approval process currently exists",
]);
export const CONNECTIONS: Option[] = [
  {
    value: "No",
    label: "No",
    description: "AI tools must stay separate from company systems.",
  },
  {
    value: "Yes, but only with explicit approval",
    label: "With explicit approval",
    description: "Clear, documented permission is required.",
  },
  {
    value: "Yes, subject to security review",
    label: "After a security review",
    description: "Risks and access permissions must be assessed first.",
  },
  {
    value: "Not sure",
    label: "Not sure yet",
    description: "Connections pause until the business decides.",
  },
];
export const REVIEWS: Option[] = [
  {
    value: "All AI-generated work",
    label: "All AI-generated work",
    description: "A person checks every output before it is used.",
  },
  {
    value: "Only important or high-impact work",
    label: "Important or high-impact work",
    description: "Prioritise work that could affect people or the business.",
  },
  {
    value: "Only work shared externally",
    label: "Work shared externally",
    description: "Review content before it leaves the business.",
  },
  {
    value: "No formal review requirement currently exists",
    label: "No formal requirement yet",
    description: "The policy will introduce minimum review safeguards.",
  },
];
export const OVERSIGHT = options([
  "Recruitment and hiring decisions",
  "Financial decisions",
  "Legal decisions",
  "Medical or health-related decisions",
  "Customer eligibility decisions",
  "Public communications",
  "Important business reports",
  "Other",
]);
export const DISCLOSURE = options([
  "Yes, always",
  "Yes, when required by the business or applicable rules",
  "Only in external communications",
  "No formal disclosure requirement",
]);
export const INCIDENTS = options([
  "Report immediately to management",
  "Report to the IT or cybersecurity team",
  "Report to the data protection or compliance team",
  "Report through an established internal incident reporting channel",
  "We do not currently have a reporting process",
]);
export const TRAINING: Option[] = [
  {
    value: "Yes, before using AI tools",
    label: "Before using AI tools",
    description: "Training comes before access.",
  },
  {
    value: "Yes, through periodic training",
    label: "Periodic training",
    description: "Keep knowledge up to date.",
  },
  {
    value: "Both",
    label: "Both",
    description: "Initial training and regular refreshers.",
  },
  {
    value: "Not currently planned",
    label: "Not currently planned",
    description: "No existing training programme is assumed.",
  },
];
export const FREQUENCIES = options([
  "Every 3 months",
  "Every 6 months",
  "Annually",
  "When significant changes occur in AI usage or business operations",
]);

export const STAGES = [
  {
    title: "About Your Business",
    short: "Your business",
    description:
      "A little context helps us make this policy fit your business.",
    icon: "building",
  },
  {
    title: "How Your Business Uses AI",
    short: "AI at work",
    description: "Tell us where AI fits into your team’s day-to-day work.",
    icon: "sparkles",
  },
  {
    title: "Data Protection and Security",
    short: "Data & security",
    description:
      "Set sensible boundaries for your information, tools and systems.",
    icon: "shield",
  },
  {
    title: "Employee Responsibilities",
    short: "Your team",
    description:
      "Make expectations clear, from human oversight to raising concerns.",
    icon: "users",
  },
];

export function hasNoTools(a: Answers) {
  return a.tools.includes(NO_TOOLS);
}
export function industryLabel(a: Answers) {
  return a.industry === "Other" ? a.industryOther.trim() : a.industry;
}
export function selectedLabel(values: string[], other: string) {
  return values
    .map((value) => (value === "Other" ? `Other (${other.trim()})` : value))
    .join("; ");
}
export function toggleSelection(
  values: string[],
  value: string,
  exclusive?: string,
): string[] {
  if (values.includes(value)) return values.filter((v) => v !== value);
  if (exclusive && (value === exclusive || values.includes(exclusive)))
    return [value];
  return [...values, value];
}

export function validateStage(stage: number, a: Answers): Errors {
  const e: Errors = {};
  const requiredText = (
    key:
      | "businessName"
      | "industryOther"
      | "country"
      | "usesOther"
      | "toolsOther"
      | "protectedDataOther"
      | "oversightOther",
    message: string,
    max = 120,
  ) => {
    if (!a[key].trim()) e[key] = message;
    else if (a[key].trim().length > max)
      e[key] = `Please use ${max} characters or fewer.`;
  };
  const requiredChoice = (
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
    message = "Please select an option.",
  ) => {
    if (!a[key]) e[key] = message;
  };
  const requiredMulti = (
    key: "uses" | "tools" | "protectedData" | "oversight",
    message: string,
  ) => {
    if (!a[key].length) e[key] = message;
  };
  if (stage === 0) {
    requiredText("businessName", "Enter your business name.");
    requiredChoice(
      "industry",
      "Choose the industry that best fits your business.",
    );
    if (a.industry === "Other")
      requiredText("industryOther", "Please specify your industry.", 100);
    requiredChoice("businessSize", "Choose your business size.");
    requiredText("country", "Enter your country of operation.", 100);
  }
  if (stage === 1) {
    requiredMulti("uses", "Select at least one current or intended use.");
    if (a.uses.includes("Other"))
      requiredText("usesOther", "Please describe the other use.", 200);
    requiredMulti(
      "tools",
      "Choose a tool, or select “We do not currently use AI tools”.",
    );
    if (a.tools.includes("Other"))
      requiredText("toolsOther", "Please name the other tools.", 200);
    if (!hasNoTools(a))
      requiredChoice("access", "Choose how employees access AI tools.");
  }
  if (stage === 2) {
    requiredMulti("protectedData", "Select at least one information category.");
    if (a.protectedData.includes("Other"))
      requiredText(
        "protectedDataOther",
        "Please describe the other information.",
        200,
      );
    requiredChoice("uploads");
    requiredChoice("approver");
    requiredChoice("connections");
  }
  if (stage === 3) {
    requiredChoice("review");
    requiredMulti(
      "oversight",
      "Select at least one activity that needs human oversight.",
    );
    if (a.oversight.includes("Other"))
      requiredText(
        "oversightOther",
        "Please describe the other activity.",
        200,
      );
    requiredChoice("disclosure");
    requiredChoice("incidents");
    requiredChoice("training");
    requiredChoice("reviewFrequency");
  }
  return e;
}

export function validateAll(a: Answers) {
  return Object.assign(
    {},
    ...[0, 1, 2, 3].map((stage) => validateStage(stage, a)),
  ) as Errors;
}
