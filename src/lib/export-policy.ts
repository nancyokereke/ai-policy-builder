import type { PolicyDocument } from "./types";
import { ATTRIBUTION } from "./types";
import { policyToText } from "./policy-engine";

export async function copyPolicy(policy: PolicyDocument): Promise<void> {
  const text = policyToText(policy);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    /* Fall back for browsers that deny the Clipboard API. */
  }
  const previous = document.activeElement as HTMLElement | null;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    textarea.remove();
    previous?.focus({ preventScroll: true });
  }
  if (!copied)
    throw new Error(
      "Clipboard access was blocked. Please allow clipboard access and try again.",
    );
}

let fontPromise: Promise<{ regular: string; bold: string }> | null = null;
function bufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
function loadFonts() {
  if (!fontPromise)
    fontPromise = Promise.all([
      fetch("/fonts/Lato-Regular.ttf").then((response) => {
        if (!response.ok) throw new Error("Could not load the document font.");
        return response.arrayBuffer();
      }),
      fetch("/fonts/Lato-Bold.ttf").then((response) => {
        if (!response.ok) throw new Error("Could not load the document font.");
        return response.arrayBuffer();
      }),
    ])
      .then(([regular, bold]) => ({
        regular: bufferToBase64(regular),
        bold: bufferToBase64(bold),
      }))
      .catch((error) => {
        fontPromise = null;
        throw error;
      });
  return fontPromise;
}

export function displayDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Paginate the same structured document that is edited, displayed and copied. */
export async function downloadPolicyPdf(policy: PolicyDocument): Promise<void> {
  const [{ jsPDF }, fonts] = await Promise.all([import("jspdf"), loadFonts()]);
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
    putOnlyUsedFonts: true,
  });
  pdf.addFileToVFS("Lato-Regular.ttf", fonts.regular);
  pdf.addFont("Lato-Regular.ttf", "Lato", "normal");
  pdf.addFileToVFS("Lato-Bold.ttf", fonts.bold);
  pdf.addFont("Lato-Bold.ttf", "Lato", "bold");
  pdf.setProperties({
    title: policy.title,
    subject: "Workplace AI usage guidelines",
    author: "AI Policy Builder — Nancy Okereke",
    creator: "AI Policy Builder",
    keywords: "AI policy, responsible AI, workplace guidelines",
  });
  const margin = 21;
  const width = 210 - margin * 2;
  const bottom = 264;
  const lineHeight = 5.35;
  let y = 24;
  const ink = "#111D32";
  const bodyColor = "#303D50";
  const muted = "#657186";
  const text = (
    value: string,
    size: number,
    bold: boolean,
    color: string,
    x = margin,
    maxWidth = width,
  ) => {
    pdf.setFont("Lato", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    const lines: string[] = pdf.splitTextToSize(value, maxWidth);
    for (const line of lines) {
      if (y + lineHeight > bottom) {
        pdf.addPage();
        y = 25;
      }
      pdf.text(line, x, y);
      y += lineHeight;
    }
  };
  const space = (height: number) => {
    y += height;
  };
  const rule = () => {
    pdf.setDrawColor("#E5E8ED");
    pdf.setLineWidth(0.25);
    pdf.line(margin, y, 210 - margin, y);
  };

  pdf.setFont("Lato", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(ink);
  pdf.text("AI POLICY BUILDER", margin, y);
  pdf.setFont("Lato", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(muted);
  pdf.text("WORKPLACE POLICY", 210 - margin, y, { align: "right" });
  space(6);
  rule();
  space(13);
  text(policy.title, 25, true, ink);
  space(4);
  text(
    "A customised starting point for establishing responsible AI practices in your business.",
    10.5,
    false,
    muted,
  );
  space(7);
  const metadata = [
    ["Business", policy.businessName],
    ["Industry", policy.industry],
    ["Country", policy.country],
    ["Effective date", displayDate(policy.effectiveDate)],
  ];
  for (let i = 0; i < metadata.length; i += 2) {
    pdf.setFont("Lato", "bold");
    pdf.setFontSize(10);
    const rowHeight = Math.max(
      ...metadata
        .slice(i, i + 2)
        .map(([, value]) => pdf.splitTextToSize(value, width / 2 - 8).length),
    );
    const requiredHeight = 9 + rowHeight * 4.7;
    if (y + requiredHeight > bottom) {
      pdf.addPage();
      y = 25;
    }
    const rowY = y;
    let maxHeight = 0;
    for (let j = 0; j < 2; j++) {
      const [label, value] = metadata[i + j];
      const x = margin + j * (width / 2);
      pdf.setFont("Lato", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(muted);
      pdf.text(label.toUpperCase(), x, y);
      pdf.setFont("Lato", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(ink);
      const lines: string[] = pdf.splitTextToSize(value, width / 2 - 8);
      pdf.text(lines, x, y + 5.5);
      maxHeight = Math.max(maxHeight, 6 + lines.length * 4.7);
    }
    y = rowY + maxHeight + 3;
  }
  text(`Policy review: ${policy.reviewFrequency}`, 9, false, muted);
  space(5);
  rule();
  space(11);

  policy.sections.forEach((section, index) => {
    pdf.setFont("Lato", "bold");
    pdf.setFontSize(13);
    const headingLines: string[] = pdf.splitTextToSize(
      `${index + 1}. ${section.title}`,
      width,
    );
    const firstParagraph = section.paragraphs[0] || "";
    pdf.setFont("Lato", "normal");
    pdf.setFontSize(10.5);
    const firstLines: string[] = pdf.splitTextToSize(firstParagraph, width);
    const needed =
      headingLines.length * 6.2 +
      Math.min(firstLines.length, 3) * lineHeight +
      10;
    if (y + needed > bottom) {
      pdf.addPage();
      y = 25;
    }
    text(`${index + 1}. ${section.title}`, 13, true, ink);
    space(3);
    section.paragraphs.forEach((paragraph) => {
      paragraph
        .split("\n")
        .forEach((line) => text(line, 10.5, false, bodyColor));
      space(3.5);
    });
    space(5);
  });
  if (y + 36 > bottom) {
    pdf.addPage();
    y = 25;
  }
  rule();
  space(8);
  text("Important notice", 10, true, ink);
  space(1);
  text(policy.disclaimer, 9, false, muted);

  const pageCount = pdf.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    pdf.setPage(page);
    pdf.setDrawColor("#E5E8ED");
    pdf.setLineWidth(0.25);
    pdf.line(margin, 275, 210 - margin, 275);
    pdf.setFont("Lato", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(muted);
    pdf.text(ATTRIBUTION, margin, 282);
    pdf.text(`Page ${page} of ${pageCount}`, 210 - margin, 282, {
      align: "right",
    });
    if (page > 1) {
      pdf.setFontSize(7);
      pdf.setTextColor(muted);
      const runningTitle =
        pdf.splitTextToSize(policy.title, 140)[0] || policy.title;
      pdf.text(runningTitle, margin, 13);
      pdf.text("AI USAGE POLICY", 210 - margin, 13, { align: "right" });
    }
  }
  const filename =
    policy.businessName
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "business";
  await pdf.save(`${filename}-ai-usage-policy.pdf`, { returnPromise: true });
}
