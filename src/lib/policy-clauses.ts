import type { Answers } from "./types";
import {
  hasNoTools,
  industryLabel,
  selectedLabel,
  NO_TOOLS,
} from "./questionnaire";

export const approvalOwner = (a: Answers): string =>
  ({
    Management: "management",
    "IT or cybersecurity team":
      "the IT or cybersecurity team (or the designated person performing that role)",
    "Data protection or compliance team":
      "the data protection or compliance team (or the designated person performing that role)",
    "Department heads":
      "the relevant department head, within an agreed business-wide approval framework",
    "A combination of these teams":
      "the designated management, IT/security, data protection/compliance and department representatives, as applicable to the business",
  })[a.approver] ||
  "management on an interim basis, until the business confirms an approval owner";

export function toolsClauses(a: Answers): string[] {
  const owner = approvalOwner(a);
  const result: string[] = [];
  if (hasNoTools(a)) {
    result.push(
      `${a.businessName.trim()} does not currently use AI tools. This policy establishes conditions for any future adoption; it does not authorise employees to start using AI. The uses described in this policy are proposed or intended uses only. Before introducing a tool, the business must approve its purpose, users, information access, account arrangements and safeguards.`,
    );
  } else {
    const tools = selectedLabel(
      a.tools.filter((t) => t !== NO_TOOLS),
      a.toolsOther,
    );
    result.push(
      `The business reported current use of the following AI tools: ${tools}. Being listed here records reported use, not automatic approval. Before relying on this policy, the business must confirm and document which tools and account plans are authorised, for which purposes, and for which employees. Proposed implementation requirement: the selected approval authority must record the authorisation status of each reported tool and account plan before further use.`,
    );
  }
  if (a.approver === "No approval process currently exists") {
    result.push(
      "No formal tool-approval process was reported. This draft proposes that management act as the interim approval owner until another owner is formally appointed. No new AI tool, paid plan, browser extension or AI-enabled application may be adopted for business use until written approval is obtained under the adopted policy. Proposed approval method: employees must submit requests to management and retain the written decision before starting the proposed use.",
    );
  } else {
    result.push(
      `Authorisation of new AI tools is the responsibility of ${owner}. Employees must obtain approval before using a new AI tool or materially expanding an existing tool’s purpose, data access or system access. Requests should explain the operational need, intended users, information involved, supplier, account type, costs and relevant risks. Approval must be recorded and communicated; silence does not mean permission.`,
    );
  }
  if (a.approver === "A combination of these teams")
    result.push(
      "The business must confirm which of these functions exist, who represents them and how their approval decisions are combined. Where a function does not exist, the business must assign its responsibilities to a competent person rather than assume that a team is already in place. Proposed decision rule: management should coordinate the relevant functions, resolve conflicting recommendations and record a final decision before use; missing expertise must be obtained rather than assumed.",
    );
  result.push(
    "The business should maintain a simple register of authorised tools, permitted purposes, account arrangements, approval decisions and restrictions. Proposed record-keeping requirement: management should maintain an internal tool register accessible to employees who need to check authorisation. Approval of a tool does not override the data, document-upload, human-review or system-connection restrictions in this policy. Employees must follow any narrower restrictions communicated for a particular tool.",
  );
  return result;
}

export function acceptableUseClauses(a: Answers): string[] {
  const uses = selectedLabel(a.uses, a.usesOther);
  const result = [
    `The ${hasNoTools(a) ? "proposed" : "reported"} areas of AI use are: ${uses}. AI may support work only within these authorised purposes and the employee’s normal responsibilities. Any materially different use must be considered through the tool-authorisation process. AI output is assistance, not a substitute for professional judgement or accountability.`,
  ];
  if (a.uses.includes("Customer support"))
    result.push(
      "For customer support, employees must verify AI-suggested responses against current, reliable business information before sending them. Customer personal information must not be entered into unapproved tools. Customers must be given a route to a human for complex queries, complaints, distress, disputed outcomes or requests outside the tool’s scope; the business must confirm that route. AI must not make unauthorised commitments, guarantees, refunds or eligibility decisions. Proposed escalation requirement: management must arrange a human support route before AI-assisted customer support is introduced; employees must refer unresolved or high-impact enquiries to management until that route is operational.",
    );
  if (a.uses.includes("Software development and coding"))
    result.push(
      "AI-assisted code must undergo appropriate human code review, testing, dependency checks and security checks before deployment. Employees must not submit secret keys, production credentials or restricted source code to unapproved tools, or accept generated code without checking its functionality, licensing and security implications.",
    );
  if (
    a.uses.includes("Data analysis") ||
    a.uses.includes("Business planning and decision-making")
  )
    result.push(
      "AI-assisted analysis and planning must be checked against reliable source data and sound reasoning. Employees must distinguish facts from estimates, identify material uncertainty and avoid treating correlation or model confidence as proof. Recommendations with significant effects on people, customers, finances or operations require the human oversight specified in this policy.",
    );
  if (
    a.uses.includes("Image and video generation") ||
    a.uses.includes("Marketing and advertising")
  )
    result.push(
      "Marketing, image and video outputs must be checked for misleading claims, appropriate rights and permissions, and respect for the people depicted. Employees must not create deceptive endorsements or impersonate real people. Use of a person’s likeness, voice or creative work must have the permissions required by applicable law, contracts and business rules.",
    );
  if (a.uses.includes("Summarising documents and reports"))
    result.push(
      "When summarising documents, employees must check the output against the original for missing context, incorrect figures, invented content and omitted limitations. A summary must not be represented as a complete or authoritative replacement for a source document where the original matters.",
    );
  if (a.uses.includes("Workflow automation"))
    result.push(
      "AI-enabled workflows must have a named business owner, defined boundaries, appropriate testing and a way to pause or reverse actions. Workflows must not be given broader access or authority than a person has approved. High-impact actions and exceptions must be routed to a human, and automated activity must be monitored for errors.",
    );
  return result;
}

export function dataClauses(a: Answers): string[] {
  const protectedTypes = selectedLabel(a.protectedData, a.protectedDataOther);
  const result = [
    `Employees must not enter the following into unapproved AI tools, including prompts, attachments, training settings or connected applications: ${protectedTypes}. When an AI tool’s approval status is unclear, treat it as unapproved and ask ${approvalOwner(a)} before sharing information.`,
    "Use the minimum information necessary. Remove or replace identifying and confidential details where the task allows, and prefer anonymised or synthetic examples. Removing a name alone does not necessarily make information anonymous. Approval to use an AI tool is not blanket permission to disclose every category of business information.",
    "Passwords, login credentials, secret keys, authentication codes and recovery codes must never be pasted into an AI prompt or exposed through an AI integration. Personal, customer, regulated and confidential information remains subject to applicable confidentiality, privacy and contractual obligations even when an AI tool is approved.",
  ];
  if (a.uploads === "No")
    result.push(
      "Company documents must not be uploaded or attached to any AI tool, including an approved tool. This restriction covers contracts, reports, presentations, spreadsheets, recordings and other business files. A change to this rule requires a documented policy revision.",
    );
  if (a.uploads === "Yes, but only to approved AI tools")
    result.push(
      "Company documents may be uploaded only to AI tools explicitly approved for the document category and intended purpose. Employees must confirm that the tool and account plan are authorised, that they have permission to use the documents, and that only necessary material is included. This permission does not extend to personal or unapproved accounts.",
    );
  if (a.uploads === "Yes, with prior management approval")
    result.push(
      "Before uploading company documents to any AI tool, employees must obtain prior management approval for the proposed upload or a clearly defined class of uploads. The approval must identify the documents, tool and account plan, purpose and any handling restrictions, and must be recorded. Approval of a tool alone is not approval to upload documents. Proposed record-keeping requirement: management and the requesting employee must retain the written upload approval with the relevant work records.",
    );
  if (a.uploads === "Not sure")
    result.push(
      "The business has not yet decided whether document uploads are appropriate. Until a documented decision is made, employees must not upload company documents to AI tools. Proposed decision requirement: management must assess the information risks and document any permitted upload conditions before this restriction is changed.",
    );
  if (a.uploads.startsWith("Yes"))
    result.push(
      "Permitted uploads remain subject to the restrictions above. Before uploading, employees must check relevant supplier terms, retention, deletion and model-training settings where available, and must not assume that an approved supplier provides protections that have not been verified.",
    );
  if (a.industry === "Healthcare")
    result.push(
      "Health information and patient-identifiable details require particular care. Use only an explicitly approved environment and lawful basis for the task; do not use a general-purpose AI tool to make clinical decisions or expose patient information without the required professional and privacy review.",
    );
  if (a.industry === "Financial Services")
    result.push(
      "Customer financial information and non-public business records must receive safeguards appropriate to their sensitivity and applicable financial-sector obligations. AI outputs must not be treated as verified financial advice, credit decisions or regulatory conclusions without qualified human review.",
    );
  if (a.industry === "Education")
    result.push(
      "Student records, assessments and identifiable learning information must not be shared with unapproved AI tools. Staff must check applicable confidentiality and safeguarding obligations and must not delegate professional judgements about learners to an AI tool.",
    );
  result.push(
    `This policy applies to operations in ${a.country.trim()} and the ${industryLabel(a).toLowerCase()} context described by the business. The business must identify the local laws, contracts and sector-specific obligations relevant to its actual activities. This draft does not certify compliance with any particular legal regime.`,
  );
  return result;
}

export function connectionsClauses(a: Answers): string[] {
  const owner = approvalOwner(a);
  if (a.connections === "No")
    return [
      "Employees must not connect AI tools, agents, plug-ins or extensions to company systems, applications, email, calendars, cloud storage, code repositories or databases. Read-only access and automatic synchronisation are still connections and are not permitted. Existing connections, if any, must be identified and disconnected unless the business formally revises this restriction.",
    ];
  if (a.connections === "Not sure")
    return [
      `The business has not confirmed its position on connecting AI tools to company systems. Until a documented decision is made, no new connection may be created and existing connections, if any, must be identified and paused pending review. Proposed review requirement: management must arrange a competent review of access, data flows and risks and record a decision before any connection is enabled or resumed.`,
    ];
  const result = [
    a.connections === "Yes, subject to security review"
      ? `Connections to company systems, applications or databases require a documented security review before activation and explicit authorisation by ${owner}. The review must be performed by a person with appropriate security competence; if that expertise is not available internally, the business must obtain it before proceeding. Proposed record-keeping requirement: the selected approval authority must retain the security assessment and decision with the relevant tool authorisation records.`
      : `Connections to company systems, applications or databases require explicit, documented authorisation by ${owner} before access is granted. The authorisation must identify the intended work purpose, systems, data, users, permissions and duration. Employees must not enable a connection based on informal or assumed permission.`,
  ];
  result.push(
    "Connections must use the least access necessary, with read-only access preferred where sufficient. The reviewer or approver must consider authentication, supplier handling of information, data flows, logging, deletion, error handling and a way to revoke access. Secrets must not be embedded in prompts or shared directly with an AI model. Access must be removed when no longer needed.",
  );
  result.push(
    "Any material expansion of permissions, new write access, new data sources or autonomous actions requires renewed approval and review. Employees must report unexpected actions or access promptly. Approval of a connection does not permit employees to bypass other policy restrictions.",
  );
  return result;
}

export function oversightClauses(a: Answers): string[] {
  const result: string[] = [];
  const base =
    "The reviewing employee is responsible for checking factual accuracy, completeness, relevance, bias, confidentiality, rights and fitness for the intended purpose. A person must understand the output sufficiently to take responsibility for its use and must correct or reject unsupported content.";
  if (a.review === "All AI-generated work")
    result.push(
      `All AI-generated work must be reviewed by a human before use, whether it is used internally or shared externally. This includes text, code, analysis, images, summaries, recommendations and automated actions. ${base}`,
    );
  if (a.review === "Only important or high-impact work")
    result.push(
      `Important or high-impact AI-generated work must be reviewed by a human before use. This includes work that could affect people’s rights, employment, finances, health, safety, customer outcomes, legal positions or the business’s reputation, as well as the specific activities listed below. Other outputs must still receive checks appropriate to their purpose and risk. ${base}`,
    );
  if (a.review === "Only work shared externally")
    result.push(
      `All AI-generated work shared outside the business must be reviewed by a human before release, including customer messages, public content, client deliverables and externally supplied reports. Internal outputs used for the high-impact activities listed below also require human oversight, regardless of the general external-sharing rule. ${base}`,
    );
  if (a.review === "No formal review requirement currently exists")
    result.push(
      `No formal review requirement was reported. As a minimum safeguard, this draft introduces human review before external use and for the high-impact activities listed below. The business must confirm who is responsible for these checks before adopting the policy. Proposed responsibility: the employee using the output must arrange competent human review, escalating to management where the necessary expertise is unavailable. ${base}`,
    );
  const activities = selectedLabel(a.oversight, a.oversightOther);
  result.push(
    `The following activities always require human oversight: ${activities}. A suitably informed person must review the relevant AI contribution and remain accountable for the final decision or action. AI must not be the sole decision-maker for these activities.`,
  );
  if (
    a.uses.includes("Human resources and recruitment") ||
    a.oversight.includes("Recruitment and hiring decisions")
  )
    result.push(
      "For recruitment and hiring, a trained human must make or substantively validate screening, shortlisting, interview, selection and rejection decisions. AI scores and recommendations are advisory only. Reviewers must check evidence, use job-related criteria, consider relevant bias and accessibility risks, and provide an appropriate route to request human reconsideration. Do not infer protected characteristics or upload candidate information to unapproved tools. Record the human decision and its rationale in accordance with applicable requirements.",
    );
  if (
    a.oversight.includes("Financial decisions") ||
    a.oversight.includes("Customer eligibility decisions")
  )
    result.push(
      "Financial and customer eligibility decisions require review by an authorised person with relevant competence. The reviewer must verify inputs, material assumptions and applicable criteria, and must ensure that affected people have an appropriate way to question an outcome. AI must not independently approve credit, pricing exceptions, claims, benefits or other consequential eligibility outcomes.",
    );
  if (a.oversight.includes("Legal decisions"))
    result.push(
      "Legal conclusions, contractual commitments and advice require review by an appropriately qualified professional before reliance. AI-generated legal text must be checked against current, applicable requirements; it must not be represented as independently verified legal advice.",
    );
  if (a.oversight.includes("Medical or health-related decisions"))
    result.push(
      "Medical or health-related decisions require review by an appropriately qualified health professional. AI output must not be used as the sole basis for diagnosis, treatment, triage or care decisions, or presented to employees or customers as a substitute for professional assessment.",
    );
  if (
    a.oversight.includes("Public communications") ||
    a.oversight.includes("Important business reports")
  )
    result.push(
      "Public communications and important business reports must be checked by an authorised reviewer for factual support, appropriate tone, confidentiality and material omissions before release. Significant claims, figures, quotations and recommendations must be traced to reliable sources.",
    );
  return result;
}

export function accountsClauses(a: Answers): string[] {
  const result: string[] = [];
  if (hasNoTools(a))
    result.push(
      "Before future AI adoption, the business must decide whether access will use company-provided accounts, approved personal accounts or a defined combination. Proposed approval requirement: the selected approval authority must document permitted account types and access conditions before any employee starts using AI. No account arrangement is authorised merely because an employee can create an account.",
    );
  else if (a.access === "Company-provided accounts")
    result.push(
      "Employees must use company-provided accounts for authorised business use of AI tools and follow the access conditions set by the business. A company-provided account must still be used only for approved tools, plans and purposes. Do not assume that paid or enterprise protections are enabled unless the business has verified them.",
    );
  else if (
    a.access === "Personal accounts" ||
    a.access === "A combination of both"
  )
    result.push(
      `The business reported use of ${a.access === "Personal accounts" ? "personal accounts" : "a combination of company-provided and personal accounts"}. A personal account is not automatically approved for business use. The business must confirm which personal accounts, tools and plans may be used and for what purposes. Unless a particular personal account and use have been explicitly approved with appropriate protections, treat it as unapproved and do not enter restricted business information, upload company documents or connect it to company systems.`,
    );
  else
    result.push(
      "The business has not confirmed how employees access AI tools. Before further business use, the account arrangements must be identified and approved. Until then, personal accounts and accounts with unclear ownership must be treated as unapproved; restricted information must not be entered into them. Proposed responsibility: management must identify accounts used for work and refer their permitted use to the selected approval authority before further use.",
    );
  if (a.access === "Personal accounts" || a.access === "A combination of both")
    result.push(
      "For any explicitly approved personal-account use, employees must maintain a strong, unique password, enable multi-factor authentication where available, keep recovery details private and prevent household members or other third parties from accessing business work. Do not synchronise company information into personal storage or use personal paid subscriptions for business without approval. The business must confirm how access and retained business information will be handled when an employee changes role or leaves.",
    );
  result.push(
    "Use strong, unique passwords and enable multi-factor authentication where the service supports it. Never share passwords, authentication codes or individual login sessions. Use only access granted for your role, do not bypass business restrictions, and sign out on shared devices. Report suspected account compromise through the incident route in this policy.",
  );
  result.push(
    "The designated approval or account owner must remove or adjust access when it is no longer needed, including when an employee leaves or changes role. Supplier settings for history, retention and training must be checked rather than assumed. Proposed responsibility: management must assign access administration before authorising use and ensure that access is revoked or adjusted and retained work information is handled securely when roles change.",
  );
  return result;
}

export function disclosureClauses(a: Answers): string[] {
  const map: Record<string, string> = {
    "Yes, always":
      "Employees must disclose when work has been generated or substantially assisted by AI, including internal work and external communications. Use a clear, proportionate statement such as “Prepared with AI assistance”. Disclosure does not transfer responsibility for the work to the tool.",
    "Yes, when required by the business or applicable rules":
      "Employees must disclose AI-generated or substantially AI-assisted content when required by business instructions, applicable rules, contractual commitments or the context of the communication. The business must communicate any activity-specific disclosure requirements. Where the requirement is unclear, ask the relevant owner before publication rather than assuming disclosure is unnecessary.",
    "Only in external communications":
      "Employees must disclose AI-generated or substantially AI-assisted content in external communications, including customer, client, supplier and public-facing content. Disclosure should be clear and appropriate to the medium. This rule does not remove any additional disclosure obligation imposed by applicable rules or contracts.",
    "No formal disclosure requirement":
      "No general AI disclosure requirement was selected. This policy does not introduce a blanket disclosure rule, but employees must not conceal AI involvement when asked, imply that AI output is independently verified, or use AI to mislead. Any applicable legal, contractual, professional or platform-specific disclosure obligations still apply.",
  };
  return [
    map[a.disclosure],
    "Employees must check permissions, attribution and licensing before using generated content and must not assume AI output is free of third-party rights or automatically protected by copyright. Do not present fabricated quotations, sources, testimonials or evidence as genuine. Remove or correct inaccurate content promptly and retain source material where required by normal business record-keeping rules.",
  ];
}

export function incidentClauses(a: Answers): string[] {
  const result: string[] = [];
  const routes: Record<string, string> = {
    "Report immediately to management":
      "Employees must report directly to management immediately. Management should communicate how employees can reach it for urgent AI-related reports; no specific contact or reporting technology is presumed by this policy.",
    "Report to the IT or cybersecurity team":
      "Employees must report to the IT or cybersecurity team, or the person formally assigned that responsibility. If employees cannot reach this function or do not know how to contact it, they must report immediately to management rather than delay.",
    "Report to the data protection or compliance team":
      "Employees must report to the data protection or compliance team, or the person formally assigned that responsibility. If employees cannot reach this function or do not know how to contact it, they must report immediately to management rather than delay.",
    "Report through an established internal incident reporting channel":
      "Employees must report through the established internal incident reporting channel. Employees who cannot access that channel must report immediately to management as a proposed fallback.",
  };
  if (a.incidents === "We do not currently have a reporting process")
    result.push(
      "No formal AI-related incident reporting process was reported. Recommendation: before adopting this policy, establish a clear reporting route, a responsible owner and a fallback for urgent incidents. Until that route is formally confirmed, this draft proposes immediate reporting to management as an interim measure; it does not claim that a formal process already exists. Proposed policy requirement: employees must report AI-related incidents to management through a designated internal reporting channel to be established and communicated by the business. Until it is available, employees must contact management directly without delay.",
    );
  else result.push(routes[a.incidents]);
  result.push(
    "Report accidental disclosure of sensitive information, suspected account compromise, suspicious AI-related activity, unsafe integrations and material errors as soon as they are noticed. Do not wait for complete evidence or delay because you are unsure whether an incident qualifies. If the normal route is unavailable, escalate directly to management.",
  );
  result.push(
    "Stop the affected activity where it is safe to do so, prevent further disclosure and preserve relevant evidence such as time, tool, prompts, outputs and screenshots without circulating sensitive material more widely. Do not delete evidence, investigate beyond your authority or attempt to conceal the incident. Cooperate with the designated response owner.",
  );
  result.push(
    "The responsible business owner must assess the incident, arrange containment and recovery, and determine whether any customer, regulator, insurer, supplier or other notification is required under applicable obligations. Employees must not make external notifications or public statements about an incident unless authorised, except where applicable law gives them an independent right or duty to report.",
  );
  return result;
}

export function trainingClauses(a: Answers): string[] {
  const result: string[] = [];
  if (a.training === "Yes, before using AI tools")
    result.push(
      "Employees must complete responsible AI training before using AI tools for business purposes. Training must cover approved tools, information restrictions, checking outputs, human oversight, disclosure, account security and incident reporting. The business must confirm how completion is recorded. Proposed administration requirement: management must arrange the required training and retain completion records before granting AI access.",
    );
  if (a.training === "Yes, through periodic training")
    result.push(
      "Employees must participate in periodic responsible AI training. The business must set and communicate the schedule, responsible owner and completion expectations. Proposed administration requirement: management must communicate a recurring training schedule appropriate to the roles and risks involved and retain attendance records. Training must reflect current tools, risks and employee responsibilities.",
    );
  if (a.training === "Both")
    result.push(
      "Employees must complete responsible AI training before using AI tools for business purposes and participate in periodic refresher training thereafter. Initial training must cover the approved environment and essential safeguards; refreshers must address changes in tools, risks, incidents and responsibilities. Proposed administration requirement: management must arrange initial training, communicate a recurring refresher schedule based on role and risk, and retain completion records.",
    );
  if (a.training === "Not currently planned")
    result.push(
      "No formal training programme is currently planned. This policy does not claim that training is already provided. Employees must still read this policy, follow its requirements and ask for guidance when uncertain. Management should consider a short practical briefing on data protection, output checking and incident reporting, and revisit the need for training as AI use develops.",
    );
  result.push(
    "Training and awareness activities should use practical, role-relevant examples and explain how to pause work and seek help. Employees must not treat completion of training as permission to ignore tool-specific restrictions or professional review requirements.",
  );
  return result;
}
