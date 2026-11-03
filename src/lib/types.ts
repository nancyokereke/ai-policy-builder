export interface Answers {
  businessName: string;
  industry: string;
  industryOther: string;
  businessSize: string;
  country: string;
  uses: string[];
  usesOther: string;
  tools: string[];
  toolsOther: string;
  access: string;
  protectedData: string[];
  protectedDataOther: string;
  uploads: string;
  approver: string;
  connections: string;
  review: string;
  oversight: string[];
  oversightOther: string;
  disclosure: string;
  incidents: string;
  training: string;
  reviewFrequency: string;
  additionalRules: string;
}

export type AnswerKey = keyof Answers;
export type TextAnswerKey = {
  [K in AnswerKey]: Answers[K] extends string ? K : never;
}[AnswerKey];
export type MultiAnswerKey = {
  [K in AnswerKey]: Answers[K] extends string[] ? K : never;
}[AnswerKey];
export type Errors = Partial<Record<AnswerKey, string>>;
export type View = "home" | "builder" | "results";

export interface PolicySection {
  id: string;
  title: string;
  paragraphs: string[];
}

export interface PolicyDocument {
  title: string;
  businessName: string;
  industry: string;
  country: string;
  effectiveDate: string;
  reviewFrequency: string;
  sections: PolicySection[];
  disclaimer: string;
}

export const DISCLAIMER =
  "The AI Policy Builder generates a practical starting point for workplace AI usage guidelines. It does not constitute legal advice, cybersecurity certification or a guarantee of compliance with applicable laws and regulations. Businesses should review and adapt the generated policy to their operations, industry and legal obligations before adopting it.";
export const ATTRIBUTION = "Created using AI Policy Builder by Nancy Okereke.";

export function emptyAnswers(): Answers {
  return {
    businessName: "",
    industry: "",
    industryOther: "",
    businessSize: "",
    country: "",
    uses: [],
    usesOther: "",
    tools: [],
    toolsOther: "",
    access: "",
    protectedData: [],
    protectedDataOther: "",
    uploads: "",
    approver: "",
    connections: "",
    review: "",
    oversight: [],
    oversightOther: "",
    disclosure: "",
    incidents: "",
    training: "",
    reviewFrequency: "",
    additionalRules: "",
  };
}
