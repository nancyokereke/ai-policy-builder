import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

async function business(page: Page, name = "Northstar Studio") {
  await page.getByLabel("Business name", { exact: false }).fill(name);
  await page.locator("#industry").selectOption("Technology");
  await page
    .getByRole("radio", { name: "11–50 employees", exact: true })
    .check();
  await page
    .getByLabel("Country of operation", { exact: false })
    .fill("Nigeria");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
async function usage(page: Page) {
  await page
    .getByRole("checkbox", {
      name: "Writing and content creation",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Human resources and recruitment",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", { name: "Customer support", exact: true })
    .check();
  await page.getByRole("checkbox", { name: "ChatGPT", exact: true }).check();
  await page
    .getByRole("radio", { name: "Personal accounts", exact: true })
    .check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
async function security(page: Page) {
  await page
    .getByRole("checkbox", {
      name: "Customer personal information",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Passwords and login credentials",
      exact: true,
    })
    .check();
  await page
    .getByRole("radio", { name: "With management approval", exact: false })
    .check();
  await page.getByRole("radio", { name: "Management", exact: true }).check();
  await page
    .getByRole("radio", { name: "After a security review", exact: false })
    .check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}
async function responsibilities(page: Page) {
  await page
    .getByRole("radio", { name: "All AI-generated work", exact: false })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Recruitment and hiring decisions",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", { name: "Public communications", exact: true })
    .check();
  await page
    .getByRole("radio", {
      name: "Only in external communications",
      exact: true,
    })
    .check();
  await page
    .getByRole("radio", {
      name: "We do not currently have a reporting process",
      exact: true,
    })
    .check();
  await page.getByRole("radio", { name: "Both", exact: false }).check();
  await page
    .getByRole("radio", { name: "Every 6 months", exact: true })
    .check();
}
async function complete(page: Page) {
  await page.goto("/#builder");
  await business(page);
  await usage(page);
  await security(page);
  await responsibilities(page);
  await page.getByRole("button", { name: "Generate My AI Policy" }).click();
  await expect(
    page.getByRole("heading", { name: "Your policy is ready." }),
  ).toBeVisible();
}

test("landing, navigation, privacy and disclaimer work without transmitting data", async ({
  page,
}) => {
  const outside: string[] = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://localhost:5173") &&
      !request.url().startsWith("data:")
    )
      outside.push(request.url());
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Give Your Team Clear Rules for Using AI.",
    }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "How It Works" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Create Your Policy in Three Steps" }),
  ).toBeInViewport();
  await page
    .getByRole("button", { name: "Privacy Notice", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("No contact details.");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Disclaimer", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "It does not constitute legal advice",
  );
  await page.getByRole("button", { name: "Understood" }).click();
  await expect(
    page.getByRole("link", { name: /Connect with Nancy/ }),
  ).toHaveAttribute("href", "https://linkedin.com/in/nancyokereke");
  await page
    .getByRole("button", { name: "Create My Policy", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "About Your Business", exact: true }),
  ).toBeVisible();
  expect(outside).toEqual([]);
});

test("required and conditional validation, backwards navigation and preserved selections", async ({
  page,
}) => {
  await page.goto("/#builder");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText("Enter your business name.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Business name", { exact: false }),
  ).toBeFocused();
  await page.getByLabel("Business name", { exact: false }).fill("Preserved Co");
  await page.locator("#industry").selectOption("Other");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText("Please specify your industry.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Your industry", { exact: false }).fill("Architecture");
  await page
    .getByRole("radio", { name: "1–10 employees", exact: true })
    .check();
  await page.getByLabel("Country of operation", { exact: false }).fill("Ghana");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator("#uses-11").check();
  await page.getByLabel("Other AI uses", { exact: false }).fill("Translation");
  await page.getByRole("checkbox", { name: "ChatGPT", exact: true }).check();
  await page
    .getByRole("checkbox", {
      name: "We do not currently use AI tools",
      exact: true,
    })
    .check();
  await expect(
    page.getByRole("checkbox", { name: "ChatGPT", exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("group", { name: /How do employees access/ }),
  ).not.toBeVisible();
  await page.getByRole("checkbox", { name: "Claude", exact: true }).check();
  await expect(
    page.getByRole("checkbox", {
      name: "We do not currently use AI tools",
      exact: true,
    }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Business name", { exact: false })).toHaveValue(
    "Preserved Co",
  );
  await expect(page.getByLabel("Your industry", { exact: false })).toHaveValue(
    "Architecture",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Other AI uses", { exact: false })).toHaveValue(
    "Translation",
  );
  await expect(
    page.getByRole("checkbox", { name: "Claude", exact: true }),
  ).toBeChecked();
});

test("full policy workbench edits, copies, downloads and preserves edited answers", async ({
  page,
  context,
}, testInfo) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await complete(page);
  await expect(page.locator(".policy-section")).toHaveCount(13);
  await expect(page.locator(".policy-paper")).toContainText(
    "For recruitment and hiring",
  );
  await expect(page.locator(".policy-paper")).toContainText(
    "A personal account is not automatically approved",
  );
  await expect(page.locator(".policy-paper")).toContainText(
    "No formal AI-related incident reporting process was reported",
  );
  await page.getByRole("button", { name: "Edit Policy", exact: true }).click();
  await page
    .getByLabel("Policy title", { exact: true })
    .fill("Northstar Edited AI Policy");
  await page
    .getByLabel("Section 1 heading", { exact: true })
    .fill("Our Purpose and Scope");
  const paragraph = page.getByLabel("Our Purpose and Scope, paragraph 1", {
    exact: true,
  });
  await paragraph.fill(
    "EDITED_POLICY_SENTINEL: This complete edited paragraph must be exported.",
  );
  await page
    .getByRole("button", { name: "Add paragraph", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Our Purpose and Scope, paragraph 6", { exact: true })
    .fill("ADDED_PARAGRAPH_SENTINEL: A new local rule.");
  await page.getByRole("button", { name: "Done Editing", exact: true }).click();
  await page.getByRole("button", { name: "Copy Policy", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Copied!", exact: true }),
  ).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  for (const text of [
    "Northstar Edited AI Policy",
    "Our Purpose and Scope",
    "EDITED_POLICY_SENTINEL",
    "ADDED_PARAGRAPH_SENTINEL",
    "13. Employee Acknowledgement",
    "Created using AI Policy Builder by Nancy Okereke.",
  ])
    expect(clipboard).toContain(text);
  expect(clipboard).not.toMatch(/\[[^\]]+\]|_{3,}|TO BE CONFIRMED/);
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download PDF", exact: true })
    .first()
    .click();
  const download = await downloadEvent;
  const path = testInfo.outputPath("edited-policy.pdf");
  await download.saveAs(path);
  const { writeFile } = await import("node:fs/promises");
  await writeFile(testInfo.outputPath("edited-policy.txt"), clipboard, "utf8");
  const bytes = await readFile(path);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.length).toBeGreaterThan(20000);
  expect(download.suggestedFilename()).toBe(
    "northstar-studio-ai-usage-policy.pdf",
  );
  await page
    .getByRole("button", { name: "Edit My Answers", exact: true })
    .click();
  await expect(page.getByLabel("Business name", { exact: false })).toHaveValue(
    "Northstar Studio",
  );
  await page.getByRole("button", { name: "View current policy" }).click();
  await expect(page.locator(".policy-paper")).toContainText(
    "EDITED_POLICY_SENTINEL",
  );
  await page
    .getByRole("button", { name: "Edit My Answers", exact: true })
    .click();
  await page
    .getByLabel("Business name", { exact: false })
    .fill("Changed Business");
  await page.getByRole("button", { name: "View current policy" }).click();
  await expect(
    page.getByText("Your questionnaire has changed.", { exact: false }),
  ).toBeVisible();
});

test("no-AI businesses receive a coherent future-adoption policy", async ({
  page,
}) => {
  await page.goto("/#builder");
  await business(page, "Future Ready");
  await page
    .getByRole("checkbox", {
      name: "Research and information gathering",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", {
      name: "We do not currently use AI tools",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await security(page);
  await responsibilities(page);
  await page.getByRole("button", { name: "Generate My AI Policy" }).click();
  await expect(page.locator(".policy-paper")).toContainText(
    "does not currently use AI tools",
  );
  await expect(page.locator(".policy-paper")).toContainText(
    "proposed or intended uses only",
  );
  await expect(page.locator(".policy-paper")).toContainText(
    "document permitted account types and access conditions",
  );
});

test("start again clears the document and all prior selections after confirmation", async ({
  page,
}) => {
  await complete(page);
  await page.getByRole("button", { name: "Start Again", exact: true }).click();
  await page
    .getByRole("button", { name: "Keep My Policy", exact: true })
    .click();
  await expect(page.locator(".policy-paper")).toBeVisible();
  await page.getByRole("button", { name: "Start Again", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start Again", exact: true })
    .click();
  await expect(page.getByLabel("Business name", { exact: false })).toHaveValue(
    "",
  );
  await expect(
    page.getByLabel("Country of operation", { exact: false }),
  ).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "View current policy" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("radio", { name: "11–50 employees", exact: true }),
  ).not.toBeChecked();
});

test("all four stages and the results are accessible in automated WCAG checks", async ({
  page,
}) => {
  async function audit() {
    await page.waitForTimeout(100);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  }
  await page.goto("/");
  await audit();
  await page
    .getByRole("button", { name: "Build My AI Policy", exact: false })
    .first()
    .click();
  await audit();
  await business(page);
  await audit();
  await usage(page);
  await audit();
  await security(page);
  await audit();
  await responsibilities(page);
  await page.getByRole("button", { name: "Generate My AI Policy" }).click();
  await expect(page.locator(".policy-paper")).toBeVisible();
  await audit();
  await page.getByRole("button", { name: "Edit Policy", exact: true }).click();
  await audit();
});

test("mobile navigation, all stages and editing fit without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: "About", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Why Your Business Needs an AI Usage Policy",
    }),
  ).toBeInViewport();
  await page
    .getByRole("button", { name: "Build My AI Policy", exact: false })
    .first()
    .click();
  await business(page);
  await usage(page);
  await security(page);
  await responsibilities(page);
  await page.getByRole("button", { name: "Generate My AI Policy" }).click();
  await expect(page.locator(".policy-paper")).toBeVisible();
  await page.getByRole("button", { name: "Edit Policy", exact: true }).click();
  await page
    .getByLabel("Policy title", { exact: true })
    .fill("A mobile edited policy");
  await page.getByRole("button", { name: "Done Editing", exact: true }).click();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const size = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(
      size.content,
      `horizontal overflow at ${width}px`,
    ).toBeLessThanOrEqual(size.viewport);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.locator(".sculpture").count()).toBe(0);
});

test("keyboard navigation, reduced motion and privacy modal focus are accessible", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  const motion = await page.locator(".sculpture").evaluate((element) => ({
    animation: getComputedStyle(element).animationName,
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  expect(motion.animation).toBe("none");
  expect(motion.scroll).toBe("auto");
  await page
    .getByRole("button", { name: "Privacy Notice", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        document.querySelector("dialog")?.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(result.violations.map((v) => v.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Privacy Notice", exact: true }),
  ).toBeFocused();
  expect(
    await page.evaluate(() => localStorage.length + sessionStorage.length),
  ).toBe(0);
});

test("clipboard fallback works when the modern clipboard API is unavailable", async ({
  page,
}) => {
  await complete(page);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Denied for fallback test");
        },
      },
    }),
  );
  await page.getByRole("button", { name: "Copy Policy", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Copied!", exact: true }),
  ).toBeVisible();
});

test("manual edits require confirmation before regeneration", async ({
  page,
}) => {
  await complete(page);
  await page.getByRole("button", { name: "Edit Policy", exact: true }).click();
  await page
    .getByLabel("Policy title", { exact: true })
    .fill("Manual title to protect");
  await page.getByRole("button", { name: "Done Editing", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit My Answers", exact: true })
    .click();
  await page
    .getByLabel("Business name", { exact: false })
    .fill("Updated Northstar");
  await page.getByRole("button", { name: /Your team/ }).click();
  await page.getByRole("button", { name: "Generate My AI Policy" }).click();
  await expect(page.getByRole("dialog")).toContainText("replace manual edits");
  await page.getByRole("button", { name: "Keep Editing", exact: true }).click();
  await page.getByRole("button", { name: "View current policy" }).click();
  await expect(page.locator(".document-title")).toHaveText(
    "Manual title to protect",
  );
  await page
    .getByRole("button", { name: "Edit My Answers", exact: true })
    .click();
  await page.getByRole("button", { name: /Your team/ }).click();
  await page.getByRole("button", { name: "Generate My AI Policy" }).click();
  await page
    .getByRole("button", { name: "Generate New Policy", exact: true })
    .click();
  await expect(page.locator(".document-title")).toHaveText(
    "Updated Northstar AI Usage Policy",
  );
});
