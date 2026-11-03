import type { Answers, PolicyDocument, PolicySection } from "./types";
import { DISCLAIMER } from "./types";
import { hasNoTools, industryLabel, validateAll } from "./questionnaire";
import {
  approvalOwner,
  accountsClauses,
  connectionsClauses,
  dataClauses,
  disclosureClauses,
  incidentClauses,
  oversightClauses,
  toolsClauses,
  trainingClauses,
  acceptableUseClauses,
} from "./policy-clauses";

export function reviewLabel(frequency: string) {
  return frequency ===
    "When significant changes occur in AI usage or business operations"
    ? "When significant changes occur"
    : frequency;
}

/** Deterministic, local-only assembly. Unconfirmed arrangements are complete, explicitly proposed requirements. */
export function generatePolicy(
  answers: Answers,
  generatedAt = new Date(),
): PolicyDocument {
  const errors = validateAll(answers);
  if (Object.keys(errors).length)
    throw new Error(
      "Please complete the required questionnaire answers before generating a policy.",
    );
  const a: Answers = {
    ...answers,
    businessName: answers.businessName.trim(),
    country: answers.country.trim(),
  };
  const name = a.businessName;
  const future = hasNoTools(a);
  const sections: PolicySection[] = [];
  const add = (id: string, title: string, paragraphs: string[]) =>
    sections.push({
      id,
      title,
      paragraphs: paragraphs.filter(Boolean).map((paragraph) => {
        // Preserve supplied additional rules verbatim; personalise authored clauses only.
        if (paragraph.startsWith("Additional business-specific rules"))
          return paragraph;
        return paragraph.replace(
          /\b(?:the business|the company)(’s|'s)?\b/gi,
          (_match, possessive) => `${name}${possessive || ""}`,
        );
      }),
    });

  add("purpose", "Purpose and Scope", [
    `This policy establishes how ${name}, a ${industryLabel(a).toLowerCase()} business with ${a.businessSize.toLowerCase()} operating in ${a.country}, may use artificial intelligence (AI) in connection with work. Its purpose is to support useful, responsible AI use while protecting people, confidential information, business systems and the quality of the business’s work.`,
    `The effective date is ${generatedAt.getFullYear()}-${String(generatedAt.getMonth() + 1).padStart(2, "0")}-${String(generatedAt.getDate()).padStart(2, "0")}, the date this policy was generated. Provisions described as proposed requirements or recommendations are arrangements for internal review and implementation, not statements that ${name} already operates those processes.`,
    future
      ? "The business does not currently use AI tools. This policy is a framework for future adoption, not permission to begin using AI. All requirements described as applying to AI use take effect before any tool is approved and introduced."
      : "This policy applies to AI use for business purposes, including use on personal accounts, personal devices, external supplier platforms and AI features embedded in other software. A tool being free, familiar or widely available does not make it approved.",
    "It applies to all employees and to contractors, temporary workers and other representatives who use AI for the business. Managers must ensure that people working under their supervision receive the policy and understand the requirements relevant to their role. Existing confidentiality, security, employment and professional obligations continue to apply.",
    "“AI tools” means services and features that generate, transform, analyse or recommend content or actions using artificial intelligence. “Approved” means explicitly authorised by the business for a stated purpose and account arrangement, not merely technically accessible. “High-impact” work includes work that could materially affect a person’s opportunities, rights, finances, health, safety or treatment, or the business’s legal or operational position.",
  ]);

  add("approved-tools", "Approved AI Tools and Authorisation", toolsClauses(a));
  add("acceptable-use", "Acceptable Use of AI", acceptableUseClauses(a));

  add("prohibited-use", "Prohibited Use of AI", [
    "Employees must not use AI to deceive, harass, discriminate, exploit, impersonate or unlawfully monitor people; generate unlawful material; infringe privacy or intellectual-property rights; or bypass legal, contractual, security or professional obligations. AI must not be used to create misleading evidence, false records, fabricated sources or unauthorised representations of the business.",
    "Do not use unapproved tools for business information, share credentials with a model, circumvent access controls, install unauthorised AI extensions or grant access to company information without the authorisation required by this policy. Do not submit restricted information in an attempt to test whether a tool will protect it.",
    "Employees must not represent AI-generated content as independently verified fact, use AI to make the high-impact decisions reserved for humans in this policy, or deploy autonomous actions outside the approved purpose. Where a requested use is unclear or conflicts with this policy, pause and seek guidance before proceeding.",
  ]);

  add("data-protection", "Data Protection and Confidential Information", [
    ...dataClauses(a),
    ...connectionsClauses(a),
  ]);
  add("human-oversight", "Human Oversight and Accuracy", oversightClauses(a));
  add(
    "content-disclosure",
    "AI-Generated Content and Disclosure",
    disclosureClauses(a),
  );
  add(
    "account-security",
    "Account Security and Access Control",
    accountsClauses(a),
  );
  add("incident-reporting", "Incident Reporting", incidentClauses(a));

  add("responsibilities", "Employee Responsibilities", [
    "Employees are responsible for understanding this policy, using only authorised tools and access arrangements, protecting information, checking outputs, meeting disclosure requirements and reporting concerns. The person using or approving AI-assisted work remains responsible for its quality and consequences; responsibility cannot be assigned to the AI tool.",
    `Employees must follow the restrictions on document uploads, system connections and human review set out in this policy. Ask ${approvalOwner(a)} when approval status or a rule is unclear. Do not treat a lack of response, another team’s use of a tool or a supplier’s marketing claim as permission.`,
    "Managers must communicate relevant restrictions, support employees in raising concerns and ensure that workloads and deadlines allow required checks. The business must confirm who owns the tool register, access decisions, training and policy maintenance. Proposed governance requirement: management must assign these responsibilities before implementation and communicate them to employees; this policy does not presume that dedicated teams or personnel already exist.",
    "Non-compliance may be addressed through the business’s applicable internal procedures, consistent with employment obligations and applicable law. The policy does not restrict legally protected reporting or other rights that cannot lawfully be limited. Questions raised in good faith and reports of suspected incidents should be treated constructively.",
    a.additionalRules.trim()
      ? `Additional business-specific rules supplied by the business:\n${a.additionalRules.trim()}\nThese additional rules supplement, and do not override, the safeguards in this policy. The business must resolve any ambiguity before adoption.`
      : "",
  ]);

  add("training", "AI Training and Awareness", trainingClauses(a));

  const schedule =
    a.reviewFrequency ===
    "When significant changes occur in AI usage or business operations"
      ? "This policy must be reviewed when significant changes occur in AI usage or business operations. No fixed calendar review interval was selected. Relevant triggers include new tools or uses, material supplier changes, new system connections, significant incidents, changes in the business’s activities and relevant legal or regulatory developments."
      : `This policy must be reviewed ${a.reviewFrequency.toLowerCase()}. The business must also review it when significant changes in tools, risks, incidents, operations or applicable obligations make an earlier review necessary.`;
  add("policy-review", "Policy Review and Updates", [
    schedule,
    "The review should consider whether approved tools and account plans remain appropriate, whether controls and restrictions are workable, what incidents or employee feedback have revealed, and whether oversight, training and reporting arrangements need updating. The business should check relevant obligations in its country and industry rather than assuming this draft is legally complete.",
    "Material updates must be approved through the business’s appropriate internal process, dated and communicated to affected employees. The business should maintain a version history and confirm whether renewed acknowledgement or training is needed. Proposed review arrangement: management must coordinate reviews, approve policy revisions and maintain a dated internal version history accessible to affected employees.",
  ]);

  add("acknowledgement", "Employee Acknowledgement", [
    "I confirm that I have received and read this AI Usage Policy, understand that I am responsible for following it, and know how to ask questions or raise a concern. I understand that AI output must be handled in accordance with the policy’s review, information-protection and disclosure requirements.",
    `Proposed acknowledgement requirement: ${name} should ask each employee to confirm in writing or through an internal acknowledgement method that they have read and understood this policy. Management should retain the confirmation and the policy version acknowledged.`,
    "Acknowledgement records should be handled under the business’s normal employment-record and privacy arrangements. This generator does not collect or store acknowledgement information.",
  ]);

  return {
    title: `${name} AI Usage Policy`,
    businessName: name,
    industry: industryLabel(a),
    country: a.country,
    effectiveDate: `${generatedAt.getFullYear()}-${String(generatedAt.getMonth() + 1).padStart(2, "0")}-${String(generatedAt.getDate()).padStart(2, "0")}`,
    reviewFrequency: a.reviewFrequency,
    sections,
    disclaimer: DISCLAIMER,
  };
}

export function policyToText(policy: PolicyDocument): string {
  const header = [
    policy.title,
    "A customised starting point for establishing responsible AI practices in your business.",
    "",
    `Business: ${policy.businessName}`,
    `Industry: ${policy.industry}`,
    `Country: ${policy.country}`,
    `Effective date: ${policy.effectiveDate}`,
    `Policy review: ${policy.reviewFrequency}`,
  ];
  return [
    ...header,
    "",
    ...policy.sections.flatMap((section, i) => [
      `${i + 1}. ${section.title}`,
      "",
      ...section.paragraphs.flatMap((p) => [p, ""]),
    ]),
    "Important notice",
    policy.disclaimer,
    "",
    "Created using AI Policy Builder by Nancy Okereke.",
  ].join("\n");
}
