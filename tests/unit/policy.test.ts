import { describe, expect, it } from "vitest";
import { emptyAnswers } from "../../src/lib/types";
import type { Answers } from "../../src/lib/types";
import {
  APPROVERS,
  CONNECTIONS,
  DISCLOSURE,
  FREQUENCIES,
  INCIDENTS,
  NO_TOOLS,
  OVERSIGHT,
  REVIEWS,
  TRAINING,
  UPLOADS,
  hasNoTools,
  toggleSelection,
  validateAll,
  validateStage,
} from "../../src/lib/questionnaire";
import { generatePolicy, policyToText } from "../../src/lib/policy-engine";

export function completeAnswers(overrides: Partial<Answers> = {}): Answers {
  return {
    ...emptyAnswers(),
    businessName: "Northstar Studio",
    industry: "Technology",
    businessSize: "11–50 employees",
    country: "Nigeria",
    uses: [
      "Writing and content creation",
      "Research and information gathering",
    ],
    tools: ["ChatGPT", "Claude"],
    access: "Company-provided accounts",
    protectedData: [
      "Customer personal information",
      "Confidential company documents",
      "Passwords and login credentials",
    ],
    uploads: "No",
    approver: "Management",
    connections: "No",
    review: "All AI-generated work",
    oversight: ["Public communications", "Important business reports"],
    disclosure: "Only in external communications",
    incidents: "Report immediately to management",
    training: "Both",
    reviewFrequency: "Annually",
    ...overrides,
  };
}
const clause = (a: Answers, id: string) =>
  generatePolicy(a)
    .sections.find((s) => s.id === id)!
    .paragraphs.join("\n");

describe("Questionnaire validation and selection logic", () => {
  it("requires essential business details and rejects whitespace", () => {
    expect(
      validateStage(0, {
        ...emptyAnswers(),
        businessName: "   ",
        country: "  ",
      }),
    ).toMatchObject({
      businessName: expect.any(String),
      country: expect.any(String),
      industry: expect.any(String),
      businessSize: expect.any(String),
    });
  });
  it("accepts complete answers and keeps additional rules optional", () => {
    expect(validateAll(completeAnswers())).toEqual({});
  });
  it("requires details for every selected Other option", () => {
    const a = completeAnswers({
      industry: "Other",
      uses: ["Other"],
      tools: ["Other"],
      protectedData: ["Other"],
      oversight: ["Other"],
    });
    expect(validateAll(a)).toMatchObject({
      industryOther: expect.any(String),
      usesOther: expect.any(String),
      toolsOther: expect.any(String),
      protectedDataOther: expect.any(String),
      oversightOther: expect.any(String),
    });
  });
  it("does not require tool access when the business has no AI tools", () => {
    expect(
      validateAll(completeAnswers({ tools: [NO_TOOLS], access: "" })),
    ).toEqual({});
  });
  it("makes no-tools selections exclusive in both directions", () => {
    expect(toggleSelection(["ChatGPT", "Claude"], NO_TOOLS, NO_TOOLS)).toEqual([
      NO_TOOLS,
    ]);
    expect(toggleSelection([NO_TOOLS], "Claude", NO_TOOLS)).toEqual(["Claude"]);
    expect(toggleSelection(["Claude"], "ChatGPT", NO_TOOLS)).toEqual([
      "Claude",
      "ChatGPT",
    ]);
    expect(toggleSelection(["Claude"], "Claude")).toEqual([]);
  });
  it("blocks incomplete generation", () => {
    expect(() => generatePolicy(emptyAnswers())).toThrow();
  });
});

describe("Modular conditional policy generation", () => {
  const base = completeAnswers();
  it("contains all 13 sections, the exact metadata and a useful level of detail", () => {
    const p = generatePolicy(base, new Date(2026, 10, 2));
    expect(p.sections).toHaveLength(13);
    expect(p.title).toBe("Northstar Studio AI Usage Policy");
    expect(p.effectiveDate).toBe("2026-11-02");
    expect(p.industry).toBe("Technology");
    expect(policyToText(p).split(/\s+/).length).toBeGreaterThan(2000);
    expect(p.sections.every((s) => s.paragraphs.length >= 1)).toBe(true);
  });
  it("frames no current AI use as future adoption, not existing use or automatic approval", () => {
    const p = generatePolicy(
      completeAnswers({ tools: [NO_TOOLS], access: "" }),
    );
    expect(
      clause(completeAnswers({ tools: [NO_TOOLS] }), "approved-tools"),
    ).toContain("does not currently use AI tools");
    expect(policyToText(p)).toContain("proposed or intended uses only");
    expect(policyToText(p)).not.toContain(
      "reported current use of the following AI tools",
    );
    expect(
      clause(completeAnswers({ tools: [NO_TOOLS] }), "account-security"),
    ).toContain("document permitted account types and access conditions");
  });
  it("adds recruitment oversight when recruitment is a use even if not in the general oversight list", () => {
    expect(
      clause(
        completeAnswers({ uses: ["Human resources and recruitment"] }),
        "human-oversight",
      ),
    ).toContain("For recruitment and hiring, a trained human");
  });
  it("adds recruitment oversight when selected independently of AI uses", () => {
    expect(
      clause(
        completeAnswers({ oversight: ["Recruitment and hiring decisions"] }),
        "human-oversight",
      ),
    ).toContain("AI scores and recommendations are advisory only");
  });
  it("adds customer privacy, accuracy and escalation provisions", () => {
    const text = clause(
      completeAnswers({ uses: ["Customer support"] }),
      "acceptable-use",
    );
    expect(text).toContain("Customer personal information must not be entered");
    expect(text).toContain("route to a human");
    expect(text).toContain("Proposed escalation requirement");
  });
  it.each(["Personal accounts", "A combination of both"])(
    "restricts and secures %s",
    (access) => {
      const text = clause(completeAnswers({ access }), "account-security");
      expect(text).toContain(
        "A personal account is not automatically approved",
      );
      expect(text).toContain("unique password");
      expect(text).toContain("multi-factor authentication");
      expect(text).toContain("leaves");
    },
  );
  it("does not invent an account arrangement when access is unknown", () => {
    expect(
      clause(completeAnswers({ access: "Not sure" }), "account-security"),
    ).toContain("management must identify accounts used for work");
  });
  it.each(UPLOADS.map((o) => o.value))(
    "has a distinct document-upload rule: %s",
    (uploads) => {
      const text = clause(completeAnswers({ uploads }), "data-protection");
      if (uploads === "No")
        expect(text).toContain(
          "must not be uploaded or attached to any AI tool",
        );
      if (uploads === "Yes, but only to approved AI tools")
        expect(text).toContain("only to AI tools explicitly approved");
      if (uploads === "Yes, with prior management approval")
        expect(text).toContain("prior management approval");
      if (uploads === "Not sure")
        expect(text).toContain("Proposed decision requirement");
    },
  );
  it("marks a missing approvals process as a proposed interim arrangement", () => {
    const text = clause(
      completeAnswers({ approver: "No approval process currently exists" }),
      "approved-tools",
    );
    expect(text).toContain("No formal tool-approval process was reported");
    expect(text).toContain("This draft proposes");
    expect(text).toContain("Proposed approval method");
  });
  it.each(APPROVERS.slice(0, 5).map((o) => o.value))(
    "reflects the chosen approver: %s",
    (approver) => {
      const a = completeAnswers({ approver });
      expect(clause(a, "approved-tools")).not.toContain(
        "No formal tool-approval process was reported",
      );
      expect(policyToText(generatePolicy(a))).toContain(
        "Authorisation of new AI tools",
      );
    },
  );
  it.each(CONNECTIONS.map((o) => o.value))(
    "has a distinct connected-system rule: %s",
    (connections) => {
      const text = clause(completeAnswers({ connections }), "data-protection");
      if (connections === "No")
        expect(text).toContain(
          "Read-only access and automatic synchronisation are still connections",
        );
      if (connections === "Not sure")
        expect(text).toContain("no new connection may be created");
      if (connections === "Yes, subject to security review")
        expect(text).toContain("documented security review before activation");
      if (connections === "Yes, but only with explicit approval")
        expect(text).toContain("explicit, documented authorisation");
    },
  );
  it.each(REVIEWS.map((o) => o.value))(
    "adapts review requirements: %s",
    (review) => {
      const text = clause(completeAnswers({ review }), "human-oversight");
      expect(text).toContain("always require human oversight");
      if (review === "All AI-generated work")
        expect(text).toContain("All AI-generated work must be reviewed");
      if (review === "No formal review requirement currently exists")
        expect(text).toContain("No formal review requirement was reported");
    },
  );
  it.each(DISCLOSURE.map((o) => o.value))(
    "adapts disclosure requirements: %s",
    (disclosure) => {
      const text = clause(
        completeAnswers({ disclosure }),
        "content-disclosure",
      );
      expect(text.length).toBeGreaterThan(300);
      if (disclosure === "No formal disclosure requirement")
        expect(text).toContain("does not introduce a blanket disclosure rule");
    },
  );
  it.each(INCIDENTS.map((o) => o.value))(
    "uses the selected incident route without inventing contacts: %s",
    (incidents) => {
      const text = clause(completeAnswers({ incidents }), "incident-reporting");
      expect(text).not.toMatch(/\[[^\]]+\]|_{3,}/);
      if (incidents === "We do not currently have a reporting process") {
        expect(text).toContain(
          "No formal AI-related incident reporting process was reported",
        );
        expect(text).toContain("interim measure");
        expect(text).toContain(
          "does not claim that a formal process already exists",
        );
      }
    },
  );
  it.each(TRAINING.map((o) => o.value))(
    "uses the selected training requirement: %s",
    (training) => {
      const text = clause(completeAnswers({ training }), "training");
      if (training === "Both") {
        expect(text).toContain("before using AI tools");
        expect(text).toContain("periodic refresher training");
      }
      if (training === "Not currently planned")
        expect(text).toContain(
          "No formal training programme is currently planned",
        );
    },
  );
  it.each(FREQUENCIES.map((o) => o.value))(
    "uses the selected review schedule: %s",
    (reviewFrequency) => {
      const text = clause(
        completeAnswers({ reviewFrequency }),
        "policy-review",
      );
      expect(text).toContain(
        reviewFrequency === FREQUENCIES[3].value
          ? "when significant changes occur"
          : reviewFrequency.toLowerCase(),
      );
      if (reviewFrequency === FREQUENCIES[3].value)
        expect(text).toContain(
          "No fixed calendar review interval was selected",
        );
    },
  );
  it("includes other descriptions and additional rules without executing or interpreting markup", () => {
    const a = completeAnswers({
      industry: "Other",
      industryOther: "Architecture",
      uses: ["Other"],
      usesOther: "Translation",
      tools: ["Other"],
      toolsOther: "Local open-weight tool",
      protectedData: ["Other"],
      protectedDataOther: "Building plans",
      oversight: ["Other"],
      oversightOther: "Safety approvals",
      additionalRules: "<script>alert(1)</script>\nAsk a manager first.",
    });
    const text = policyToText(generatePolicy(a));
    for (const phrase of [
      "Architecture",
      "Translation",
      "Local open-weight tool",
      "Building plans",
      "Safety approvals",
      "<script>alert(1)</script>",
      "Ask a manager first.",
    ])
      expect(text).toContain(phrase);
  });
  it.each(["Healthcare", "Financial Services", "Education"])(
    "includes relevant industry context for %s",
    (industry) => {
      expect(
        clause(completeAnswers({ industry }), "data-protection"),
      ).toContain(
        (
          {
            Healthcare: "patient-identifiable",
            "Financial Services": "financial-sector",
            Education: "Student records",
          } as Record<string, string>
        )[industry],
      );
    },
  );
  it("produces different policies for different choices, not only a changed name", () => {
    expect(policyToText(generatePolicy(base))).not.toBe(
      policyToText(
        generatePolicy({
          ...base,
          access: "Personal accounts",
          uploads: "Yes, with prior management approval",
          incidents: "We do not currently have a reporting process",
        }),
      ),
    );
  });
  it("is deterministic and does not mutate answers", () => {
    const a = completeAnswers();
    const original = JSON.stringify(a);
    const date = new Date(2026, 10, 2);
    expect(generatePolicy(a, date)).toEqual(generatePolicy(a, date));
    expect(JSON.stringify(a)).toBe(original);
    expect(hasNoTools(a)).toBe(false);
  });
  it("does not carry deselected Other values into generated content", () => {
    const text = policyToText(
      generatePolicy(
        completeAnswers({
          usesOther: "Unused description",
          toolsOther: "Unused tool",
        }),
      ),
    );
    expect(text).not.toContain("Unused description");
    expect(text).not.toContain("Unused tool");
  });
  it("exports every paragraph, metadata, disclaimer and attribution", () => {
    const p = generatePolicy(base);
    const text = policyToText(p);
    for (const section of p.sections) {
      expect(text).toContain(section.title);
      for (const paragraph of section.paragraphs)
        expect(text).toContain(paragraph);
    }
    expect(text).toContain(p.disclaimer);
    expect(text).toContain("Created using AI Policy Builder by Nancy Okereke.");
  });
});

describe("Complete personalised policies without template fields", () => {
  const cases: Partial<Answers>[] = [
    {},
    { tools: [NO_TOOLS], access: "" },
    ...APPROVERS.map(({ value }) => ({ approver: value })),
    ...UPLOADS.map(({ value }) => ({ uploads: value })),
    ...CONNECTIONS.map(({ value }) => ({ connections: value })),
    ...REVIEWS.map(({ value }) => ({ review: value })),
    ...DISCLOSURE.map(({ value }) => ({ disclosure: value })),
    ...INCIDENTS.map(({ value }) => ({ incidents: value })),
    ...TRAINING.map(({ value }) => ({ training: value })),
    { access: "Not sure" },
    { access: "Personal accounts" },
    { access: "A combination of both" },
    { uses: ["Customer support", "Human resources and recruitment"] },
  ];
  it.each(cases)("has complete provisions for %j", (overrides) => {
    const policy = generatePolicy(
      completeAnswers(overrides),
      new Date(2026, 10, 2),
    );
    const text = policyToText(policy);
    expect(text).not.toMatch(
      /\[[^\]]+\]|_{3,}|to be confirmed|to be completed|insert (?:business|reporting|department|approval|company|date)/i,
    );
    expect(text).toContain("Northstar Studio");
    expect(text).toContain("11–50 employees");
    expect(text).toContain("Nigeria");
    expect(text).toContain("Technology");
    expect(policy.effectiveDate).toBe("2026-11-02");
    for (const section of policy.sections) {
      expect(section.paragraphs.length).toBeGreaterThan(0);
      expect(section.paragraphs.every((p) => p.trim().length > 0)).toBe(true);
      expect(section.paragraphs.join(" ")).not.toMatch(
        /\bthe business(?:’s)?\b/i,
      );
    }
  });
  it("preserves literal business names and supplied rules", () => {
    const businessName = "O’Neil & Co. $&";
    const additionalRules = "Only the business may publish approved reports.";
    const text = policyToText(
      generatePolicy(completeAnswers({ businessName, additionalRules })),
    );
    expect(text).toContain(businessName);
    expect(text).toContain(additionalRules);
    expect(text).toContain("ChatGPT; Claude");
  });
  it("sets a complete proposed reporting channel without inventing its existence", () => {
    const text = clause(
      completeAnswers({
        incidents: "We do not currently have a reporting process",
      }),
      "incident-reporting",
    );
    expect(text).toContain(
      "designated internal reporting channel to be established and communicated by Northstar Studio",
    );
    expect(text).toContain(
      "Until it is available, employees must contact management directly without delay",
    );
    expect(text).not.toContain("@");
  });
  it("uses the local generation date by default", () => {
    const now = new Date();
    expect(generatePolicy(completeAnswers()).effectiveDate).toBe(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
    );
  });
});
