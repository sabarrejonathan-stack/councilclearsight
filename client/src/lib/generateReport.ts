import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Type for autoTable finalY tracking
let lastFinalY = 0;

interface CouncilData {
  name: string;
  councilType: string;
  county: string | null;
  region: string | null;
  websiteUrl: string | null;
  email: string | null;
  clerkName: string | null;
  vdtiOverallScore: string | number | null;
  vdtiPillar1Score: string | number | null;
  vdtiPillar2Score: string | number | null;
  vdtiPillar3Score: string | number | null;
  vdtiPillar4Score: string | number | null;
  vdtiOverallRank: number | null;
  vdtiRegionalRank: number | null;
  vdtiPercentile: string | number | null;
  hasWebsite: boolean | null;
  hasAgendas: boolean | null;
  hasMinutes: boolean | null;
  hasFinancials: boolean | null;
  hasContactDetails: boolean | null;
  hasAccessibilityStatement: boolean | null;
  schoolCount: number;
  populationBand: string | null;
}

interface PeerData {
  name: string;
  vdtiOverallScore: string | number | null;
}

interface StatsData {
  avgScore: number;
  totalCouncils: number;
  maxScore?: number;
  minScore?: number;
}

interface ReportInput {
  council: CouncilData;
  peers: PeerData[];
  countyStats: StatsData;
  nationalStats: StatsData;
}

// ─── Colour palette ─────────────────────────────────────────────────────────
const NAVY: [number, number, number] = [15, 41, 66];     // #0f2942
const TEAL: [number, number, number] = [42, 157, 143];   // #2a9d8f
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_BG: [number, number, number] = [248, 250, 252]; // #f8fafc
const SLATE: [number, number, number] = [100, 116, 139];   // #64748b
const DARK: [number, number, number] = [15, 23, 42];       // #0f172a
const AMBER: [number, number, number] = [245, 158, 11];    // #f59e0b
const RED: [number, number, number] = [239, 68, 68];       // #ef4444

function getScoreColor(score: number): [number, number, number] {
  if (score >= 70) return TEAL;
  if (score >= 55) return [59, 130, 246]; // blue
  if (score >= 40) return AMBER;
  return RED;
}

function getLetterGrade(score: number): string {
  if (score >= 85) return "A";
  if (score >= 70) return "B+";
  if (score >= 55) return "B";
  if (score >= 40) return "C";
  return "D";
}

function getScoreBand(score: number): string {
  if (score >= 85) return "Exemplary";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Mid-tier";
  if (score >= 40) return "Below median";
  return "High-risk";
}

function formatPopBand(band: string | null): string {
  if (!band) return "Not specified";
  const map: Record<string, string> = {
    under_500: "Under 500",
    "500_2000": "500-2,000",
    "2000_5000": "2,000-5,000",
    "5000_15000": "5,000-15,000",
    over_15000: "Over 15,000",
  };
  return map[band] || band;
}

function n(val: string | number | null | undefined): number {
  return Number(val) || 0;
}

// ─── Recommendation templates ────────────────────────────────────────────────
function generateRecommendations(council: CouncilData) {
  const recs: Array<{
    title: string;
    impact: string;
    pillar: string;
    effort: string;
    body: string;
    source: string;
  }> = [];

  const overall = n(council.vdtiOverallScore);
  const p1 = n(council.vdtiPillar1Score);
  const p2 = n(council.vdtiPillar2Score);
  const p3 = n(council.vdtiPillar3Score);
  const p4 = n(council.vdtiPillar4Score);

  // P1: Digital Presence (max 25)
  if (!council.hasWebsite || p1 < 20) {
    recs.push({
      title: "Establish or significantly improve the council website",
      impact: "+8-12 pts",
      pillar: "Digital Presence",
      effort: "Moderate",
      body: `A well-structured council website is the foundation of digital transparency. ${council.name} should ensure its website includes clear navigation, up-to-date meeting information, and accessible contact details. Free or low-cost website builders suitable for parish councils are available through providers such as Hugo Fox, 2commune, and Parish Council Websites.`,
      source: "Local Government Transparency Code 2015; NALC website guidance",
    });
  }
  if (!council.hasAgendas) {
    recs.push({
      title: "Publish meeting agendas online at least 3 clear days before meetings",
      impact: "+4-6 pts",
      pillar: "Digital Presence",
      effort: "Low cost",
      body: `Publishing agendas in advance is a legal requirement under the Local Government Act 1972, Schedule 12. ${council.name} should ensure agendas are published on the council website at least 3 clear days before each meeting, in an accessible format. This is one of the most impactful quick wins for improving the Transparency pillar score.`,
      source: "Local Government Act 1972, Schedule 12, para 10(2); Transparency Code 2015",
    });
  }
  if (!council.hasMinutes) {
    recs.push({
      title: "Publish approved meeting minutes within 28 days",
      impact: "+4-6 pts",
      pillar: "Digital Presence",
      effort: "Low cost",
      body: `Meeting minutes should be published on the council website promptly after approval. ${council.name} should aim to publish draft minutes within 28 days of each meeting, with approved minutes clearly marked. This demonstrates accountability and allows residents to follow council decisions.`,
      source: "Local Government Act 1972, Schedule 12; NALC Legal Topic Note 40",
    });
  }
  if (!council.hasFinancials) {
    recs.push({
      title: "Publish annual accounts and financial information online",
      impact: "+3-5 pts",
      pillar: "Digital Presence",
      effort: "Low cost",
      body: `Financial transparency is a core requirement for parish and town councils. ${council.name} should publish its Annual Governance and Accountability Return (AGAR), including the annual return, internal audit report, and notice of public rights, on its website. Councils with turnover exceeding GBP 25,000 must also comply with the Transparency Code.`,
      source: "Accounts and Audit Regulations 2015; Local Government Transparency Code 2015",
    });
  }

  // P2: Contact Transparency (max 25)
  if (p2 < 15) {
    recs.push({
      title: "Establish a structured resident engagement programme with published feedback loops",
      impact: "+6-10 pts",
      pillar: "Governance & Compliance",
      effort: "Low cost",
      body: `A structured engagement programme  -  including a 'You Said, We Did' page on your website, published responses to resident feedback, and regular community drop-in sessions  -  would address a significant gap in the Governance & Compliance pillar. Publishing how the council has responded to feedback demonstrates the accountability loop that distinguishes higher-scoring councils. Guidance is available from NALC and SLCC at no cost.`,
      source: "NALC Good Councillor Guide (2022), Section 4: Community Engagement",
    });
  }
  if (!council.hasContactDetails) {
    recs.push({
      title: "Publish comprehensive contact details including a dedicated enquiry form",
      impact: "+3-5 pts",
      pillar: "Governance & Compliance",
      effort: "Minimal cost",
      body: `${council.name} should ensure that the clerk's name, email address, phone number, and office hours are clearly published on the council website. Adding a dedicated online enquiry form makes it easier for residents to get in touch and creates a record of interactions.`,
      source: "Local Government Transparency Code 2015; NALC website guidance",
    });
  }

  // P3: Governance & Compliance (max 25)
  if (p3 < 15) {
    recs.push({
      title: "Publish standing orders and financial regulations",
      impact: "+5-10 pts",
      pillar: "Governance & Compliance",
      effort: "Low cost",
      body: `Standing orders and financial regulations are the foundation of proper council governance. ${council.name} should adopt NALC model standing orders and financial regulations, and publish them prominently on the council website. These documents demonstrate that the council operates within a formal governance framework.`,
      source: "NALC Model Standing Orders (2018); NALC Model Financial Regulations",
    });
  }
  if (p3 < 20) {
    recs.push({
      title: "Publish a register of members' interests",
      impact: "+5 pts",
      pillar: "Governance & Compliance",
      effort: "Minimal cost",
      body: `The Localism Act 2011 requires councillors to declare and publish their interests. ${council.name} should ensure a register of members' interests is published on the council website and kept up to date. This demonstrates transparency and helps prevent conflicts of interest.`,
      source: "Localism Act 2011, Chapter 7; Monitoring Officer guidance",
    });
  }

  // P4: Financial Accountability (max 25)
  if (p4 < 10) {
    recs.push({
      title: "Publish the Annual Governance and Accountability Return (AGAR)",
      impact: "+5-10 pts",
      pillar: "Financial Accountability",
      effort: "Low cost",
      body: `The AGAR (Sections 1 and 2) is a statutory requirement under the Accounts and Audit Regulations 2015. ${council.name} should publish both sections on the council website, along with the notice of public rights. This is one of the most impactful actions for improving the Financial Accountability pillar score.`,
      source: "Accounts and Audit Regulations 2015 (SI 2015/234)",
    });
  }
  if (p4 < 15) {
    recs.push({
      title: "Publish an asset register",
      impact: "+5 pts",
      pillar: "Financial Accountability",
      effort: "Minimal cost",
      body: `The Transparency Code for Smaller Authorities requires councils to publish a list of all land and property assets. ${council.name} should publish a comprehensive asset register on the council website, including details of each asset's value and purpose.`,
      source: "Transparency Code for Smaller Authorities (DCLG, 2015)",
    });
  }
  if (!council.hasAccessibilityStatement) {
    recs.push({
      title: "Publish an accessibility statement on the council website",
      impact: "+5 pts",
      pillar: "Digital Presence",
      effort: "Minimal cost",
      body: `Public sector websites are required to meet accessibility standards under the Public Sector Bodies Accessibility Regulations 2018. ${council.name} should publish an accessibility statement explaining what standards it meets and how users can report problems. Template statements are available from the Central Digital and Data Office.`,
      source: "Public Sector Bodies Accessibility Regulations 2018 (SI 2018/952); CDDO guidance",
    });
  }

  // Ensure we always have at least 8 recommendations
  const fillers = [
    {
      title: "Publish councillor attendance records for all meetings",
      impact: "+2-3 pts",
      pillar: "Financial Accountability",
      effort: "Minimal cost",
      body: `Publishing councillor attendance records for all council and committee meetings demonstrates accountability and allows residents to monitor the engagement of their elected representatives. This information should be published on the council website and updated after each meeting.`,
      source: "Local Government Act 1972; NALC Good Councillor Guide",
    },
    {
      title: "Create a dedicated planning applications page with council responses",
      impact: "+2-4 pts",
      pillar: "Digital Presence",
      effort: "Low cost",
      body: `A dedicated page listing planning applications considered by the council, along with the council's responses, improves transparency around one of the most resident-facing aspects of parish council work. This is particularly valuable in areas experiencing development pressure.`,
      source: "Town and Country Planning Act 1990; NALC planning guidance",
    },
    {
      title: "Establish a social media presence with regular updates",
      impact: "+2-4 pts",
      pillar: "Governance & Compliance",
      effort: "Minimal cost",
      body: `An active social media presence  -  particularly on Facebook, which has the highest reach among parish council audiences  -  extends the council's digital engagement beyond its website. Regular posts about meetings, decisions, and community events help keep residents informed and engaged.`,
      source: "NALC Digital Communications guidance; LGA social media guide",
    },
    {
      title: "Publish a register of councillor interests on the council website",
      impact: "+1-3 pts",
      pillar: "Financial Accountability",
      effort: "Minimal cost",
      body: `While registers of interest are held by the monitoring officer at the principal authority, publishing a copy or link on the parish council website improves accessibility for residents. This demonstrates a commitment to transparency beyond the minimum legal requirement.`,
      source: "Localism Act 2011, s.29; NALC Legal Topic Note 80",
    },
    {
      title: "Publish grant and Section 137 expenditure records",
      impact: "+1-3 pts",
      pillar: "Digital Presence",
      effort: "Minimal cost",
      body: `Publishing details of grants awarded and Section 137 expenditure (discretionary spending for community benefit) demonstrates how the council uses public money to support local organisations and causes. This information should be published annually alongside the council's financial statements.`,
      source: "Local Government Act 1972, s.137; Transparency Code 2015",
    },
  ];

  while (recs.length < 8) {
    const filler = fillers.shift();
    if (!filler) break;
    // Avoid duplicates
    if (!recs.some((r) => r.title === filler.title)) {
      recs.push(filler);
    }
  }

  return recs.slice(0, 8);
}

// ─── PDF Generation ──────────────────────────────────────────────────────────
export function generateCouncilReport(data: ReportInput): void {
  const { council, peers, countyStats, nationalStats } = data;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const overall = n(council.vdtiOverallScore);
  const p1 = n(council.vdtiPillar1Score);
  const p2 = n(council.vdtiPillar2Score);
  const p3 = n(council.vdtiPillar3Score);
  const p4 = n(council.vdtiPillar4Score);
  const maxP1 = 25, maxP2 = 25, maxP3 = 25, maxP4 = 25;

  // ─── Helper functions ────────────────────────────────────────────────────
  function addPageFooter(pageNum: number) {
    doc.setFillColor(...LIGHT_BG);
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.text("Council ClearSight - Independent Performance Assessment", margin, pageHeight - 5);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 5, { align: "right" });
    doc.text("info@councilclearsight.org.uk", pageWidth / 2, pageHeight - 5, { align: "center" });
  }

  function checkPageBreak(needed: number, pageNum: { value: number }): number {
    if (y + needed > pageHeight - 20) {
      addPageFooter(pageNum.value);
      doc.addPage();
      pageNum.value++;
      return 20;
    }
    return y;
  }

  function drawProgressBar(x: number, yPos: number, width: number, score: number, max: number) {
    const pct = Math.min(1, score / max);
    const barHeight = 5;
    // Background
    doc.setFillColor(226, 232, 240); // slate-200
    doc.roundedRect(x, yPos, width, barHeight, 2, 2, "F");
    // Fill
    const color = getScoreColor((score / max) * 100);
    doc.setFillColor(...color);
    doc.roundedRect(x, yPos, width * pct, barHeight, 2, 2, "F");
  }

  const pageNum = { value: 1 };

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1: Cover
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Navy header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 85, "F");

  // Teal accent line
  doc.setFillColor(...TEAL);
  doc.rect(0, 85, pageWidth, 3, "F");

  // Title text
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("COUNCIL CLEARSIGHT", margin, 25);
  doc.setFontSize(8);
  doc.text("Independent Performance Assessment", margin, 32);

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  const councilName = council.name;
  const nameLines = doc.splitTextToSize(councilName, contentWidth);
  doc.text(nameLines, margin, 52);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Public Assessment Report - January-March 2026", margin, 72);
  doc.setFontSize(8);
  doc.text(`${council.councilType.charAt(0).toUpperCase() + council.councilType.slice(1)} Council · ${council.county || "England"} · ${council.region || "England"}`, margin, 78);

  // Score summary box
  y = 100;
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentWidth, 45, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 45, 3, 3, "S");

  // Overall score circle
  const circleX = margin + 25;
  const circleY = y + 22.5;
  const scoreColor = getScoreColor(overall);
  doc.setFillColor(...scoreColor);
  doc.circle(circleX, circleY, 16, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(String(Math.round(overall)), circleX, circleY + 2, { align: "center" });
  doc.setFontSize(7);
  doc.text("/100", circleX, circleY + 8, { align: "center" });

  // Score band
  doc.setTextColor(...DARK);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Grade ${getLetterGrade(overall)} — ${getScoreBand(overall)}`, margin + 48, y + 15);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text(`VDTI Score: ${Math.round(overall)} out of 100 (public assessment cap)`, margin + 48, y + 22);
  
  // Rankings
  if (council.vdtiOverallRank) {
    doc.text(`National rank: ${council.vdtiOverallRank} of ${nationalStats.totalCouncils}`, margin + 48, y + 29);
  }
  if (council.vdtiRegionalRank && council.region) {
    doc.text(`Regional rank (${council.region}): ${council.vdtiRegionalRank}`, margin + 48, y + 35);
  }
  const pctile = n(council.vdtiPercentile);
  if (pctile > 0) {
    doc.text(`Percentile: Top ${Math.round(100 - pctile)}%`, margin + 48, y + 41);
  }

  // Pillar summary
  y = 155;
  doc.setTextColor(...DARK);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Four-Pillar Performance Breakdown", margin, y);
  y += 8;

  const pillars = [
    { name: "Digital Presence", score: p1, max: maxP1, weight: "25%" },
    { name: "Contact Transparency", score: p2, max: maxP2, weight: "25%" },
    { name: "Governance & Compliance", score: p3, max: maxP3, weight: "25%" },
    { name: "Financial Accountability", score: p4, max: maxP4, weight: "25%" },
  ];

  pillars.forEach((pillar) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(`${pillar.name} (${pillar.weight})`, margin, y + 3);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE);
    doc.text(`${pillar.score.toFixed(1)} / ${pillar.max}`, margin + contentWidth - 25, y + 3, { align: "right" });
    const pct = Math.round((pillar.score / pillar.max) * 100);
    doc.text(`${pct}%`, margin + contentWidth, y + 3, { align: "right" });
    drawProgressBar(margin, y + 6, contentWidth, pillar.score, pillar.max);
    y += 16;
  });

  // Council details
  y += 5;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Council Details", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 2.5, textColor: DARK },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45, textColor: [...SLATE] },
      1: { cellWidth: contentWidth - 45 },
    },
    body: [
      ["Council type", `${council.councilType.charAt(0).toUpperCase() + council.councilType.slice(1)} council`],
      ["County", council.county || "Not specified"],
      ["Region", council.region || "Not specified"],
      ["Population band", formatPopBand(council.populationBand)],
      ["Website", council.websiteUrl || "No website found"],
      ["Clerk", council.clerkName || "Not published"],
      ["Contact email", council.email || "Not published"],
      ["Schools in area", `${council.schoolCount} school(s) identified`],
    ],
    didDrawPage: (data: any) => { lastFinalY = data.cursor?.y ?? y + 40; },
  });

  y = lastFinalY + 5;

  // Assessment period note
  doc.setFillColor(235, 248, 246);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.text("Assessment period: January-March 2026", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text("This report is based on publicly available data collected during the standard annual assessment window.", margin + 4, y + 11);
  doc.text("Scores reflect data as of 31 March 2026. Subscribing councils can request an updated assessment at any time.", margin + 4, y + 15);

  addPageFooter(pageNum.value);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2: Methodology + Peer Comparison
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageNum.value++;
  y = 20;

  // Methodology section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("How This Score Was Calculated", margin, y);
  y += 8;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  const methodText = [
    `The VDTI (Verifiable Digital Transparency Index) assesses parish and town councils across four equal pillars, each worth 25 points: Digital Presence, Contact Transparency, Governance & Compliance, and Financial Accountability. Each pillar is scored using publicly verifiable indicators — data that any resident, journalist, or councillor can independently check.`,
    ``,
    `Scores above 88 typically require subscriber-level manual verification to confirm engagement evidence and internal governance documents. Subscribing councils receive a full assessment within 4 weeks, including a detailed improvement roadmap.`,
    ``,
    `Scores are size-normalised to ensure fair comparison between councils serving populations of 500 and those serving 50,000+. The methodology version used for this assessment is VDTI v2.0.`,
  ];
  const methodLines = doc.splitTextToSize(methodText.join("\n"), contentWidth);
  doc.text(methodLines, margin, y);
  y += methodLines.length * 3.8 + 5;

  // Transparency indicators table
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Transparency Indicators", margin, y);
  y += 5;

  const indicators = [
    { label: "Council website", present: council.hasWebsite },
    { label: "Meeting agendas published", present: council.hasAgendas },
    { label: "Meeting minutes published", present: council.hasMinutes },
    { label: "Financial information published", present: council.hasFinancials },
    { label: "Contact details published", present: council.hasContactDetails },
    { label: "Accessibility statement", present: council.hasAccessibilityStatement },
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [...NAVY], textColor: [...WHITE], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 3, textColor: [...DARK] },
    head: [["Indicator", "Status", "Impact"]],
    body: indicators.map((ind) => [
      ind.label,
      ind.present ? "YES - Found" : "NO - Not found",
      ind.present ? "Points awarded" : "Improvement opportunity",
    ]),
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 1) {
        const ind = indicators[data.row.index];
        if (ind) {
          data.cell.styles.textColor = ind.present ? [...TEAL] : [...RED];
        }
      }
    },
    didDrawPage: (data: any) => { lastFinalY = data.cursor?.y ?? y + 40; },
  });

  y = lastFinalY + 10;
  y = checkPageBreak(50, pageNum);

  // Peer comparison
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(`Peer Comparison - ${council.county || "County"} ${council.councilType} councils`, margin, y);
  y += 5;

  const topPeers = peers.slice(0, 10);
  if (topPeers.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "striped",
      headStyles: { fillColor: [...NAVY], textColor: [...WHITE], fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [...DARK] },
      head: [["Rank", "Council", "VDTI Score"]],
      body: topPeers.map((peer, i) => [
        String(i + 1),
        peer.name + (peer.name === council.name ? " *" : ""),
        `${Math.round(n(peer.vdtiOverallScore))} / 100`,
      ]),
      didParseCell: (data: any) => {
        if (data.section === "body") {
          const peer = topPeers[data.row.index];
          if (peer && peer.name === council.name) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [42, 157, 143, 20];
          }
        }
      },
      didDrawPage: (data: any) => { lastFinalY = data.cursor?.y ?? y + 40; },
    });
    y = lastFinalY + 8;
  }

  // Stats comparison
  y = checkPageBreak(30, pageNum);
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Comparative Statistics", margin + 4, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text(`${council.county || "County"} average: ${countyStats.avgScore} / 100 (${countyStats.totalCouncils} councils)`, margin + 4, y + 12);
  doc.text(`National average: ${nationalStats.avgScore} / 100 (${nationalStats.totalCouncils} councils)`, margin + 4, y + 17);
  if (countyStats.maxScore) {
    doc.text(`${council.county || "County"} highest: ${countyStats.maxScore} / 100 · Lowest: ${countyStats.minScore} / 100`, margin + contentWidth / 2 + 4, y + 12);
  }

  addPageFooter(pageNum.value);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3: Recommendations (first visible, rest blurred)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageNum.value++;
  y = 20;

  const recommendations = generateRecommendations(council);

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Improvement Recommendations", margin, y);
  y += 4;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text("Each recommendation is specific, achievable, and linked to a measurable VDTI score impact.", margin, y + 4);
  y += 12;

  // RECOMMENDATION 1 - FULLY VISIBLE
  if (recommendations.length > 0) {
    const rec = recommendations[0];
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "F");
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "S");

    // Number badge
    doc.setFillColor(...TEAL);
    doc.circle(margin + 8, y + 8, 4, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("1", margin + 8, y + 9.5, { align: "center" });

    // Title
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(rec.title, contentWidth - 30);
    doc.text(titleLines, margin + 16, y + 9);

    // Meta
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE);
    doc.text(`${rec.pillar} · ${rec.effort}`, margin + 16, y + 16);
    doc.setTextColor(...TEAL);
    doc.setFont("helvetica", "bold");
    doc.text(rec.impact, margin + contentWidth - 4, y + 9, { align: "right" });

    // Body
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    const bodyLines = doc.splitTextToSize(rec.body, contentWidth - 10);
    doc.text(bodyLines, margin + 5, y + 22);

    // Source
    const bodyEndY = y + 22 + bodyLines.length * 3.5;
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE);
    doc.text(`Source: ${rec.source}`, margin + 5, bodyEndY + 2);

    y += 55;
  }

  // RECOMMENDATIONS 2-8 - BLURRED / LOCKED
  y += 3;
  doc.setFillColor(248, 250, 252);
  const blurBoxHeight = Math.min(pageHeight - y - 25, 145);
  doc.roundedRect(margin, y, contentWidth, blurBoxHeight, 3, 3, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, blurBoxHeight, 3, 3, "S");

  // Simulate blurred text lines for recommendations 2-8
  const blurStartY = y + 8;
  for (let i = 1; i < Math.min(recommendations.length, 8); i++) {
    const recY = blurStartY + (i - 1) * 18;
    if (recY + 15 > y + blurBoxHeight) break;

    // Number circle (faded)
    doc.setFillColor(203, 213, 225);
    doc.circle(margin + 8, recY + 2, 4, "F");
    doc.setTextColor(248, 250, 252);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(String(i + 1), margin + 8, recY + 3.5, { align: "center" });

    // Blurred title bar
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(margin + 16, recY - 1, contentWidth * 0.55, 5, 1.5, 1.5, "F");

    // Blurred meta bar
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin + 16, recY + 6, contentWidth * 0.3, 3, 1, 1, "F");

    // Blurred impact badge
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(margin + contentWidth - 25, recY - 1, 22, 5, 1.5, 1.5, "F");
  }

  // Lock overlay
  const lockY = y + blurBoxHeight / 2 - 15;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin + contentWidth / 2 - 55, lockY, 110, 30, 4, 4, "F");
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin + contentWidth / 2 - 55, lockY, 110, 30, 4, 4, "S");

  doc.setTextColor(...NAVY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("7 more recommendations", pageWidth / 2, lockY + 10, { align: "center" });
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...TEAL);
  doc.text("Available with a Council ClearSight subscription", pageWidth / 2, lockY + 16, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(...SLATE);
  doc.text("Subscribe from GBP 390/year - see pricing at councilclearsight.org.uk", pageWidth / 2, lockY + 22, { align: "center" });

  addPageFooter(pageNum.value);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4: Subscription CTA + Next Steps
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageNum.value++;
  y = 20;

  // Header
  doc.setFillColor(...NAVY);
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("What Happens Next?", margin + 8, y + 15);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("A member of the Council ClearSight team will be in contact within", margin + 8, y + 24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEAL);
  doc.text("5 working days", margin + 8, y + 30);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 220);
  doc.text("to discuss this assessment and how we can help.", margin + 48, y + 30);
  y += 50;

  // What subscribers receive
  doc.setTextColor(...DARK);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("What a Council ClearSight Subscription Includes", margin, y);
  y += 8;

  const benefits = [
    ["Updated assessment", "Delivered within 4 weeks of subscribing - your score reflects your most recent improvements"],
    ["Full evidence dossier", "Every indicator backed by source URLs that you and your residents can verify independently"],
    ["Actionable recommendations", "Gold: 5 recommendations. Platinum: 12 recommendations. Each with cited sources and projected score impact"],
    ["Peer benchmarking", "Gold: 3 nearest peers. Platinum: full county/regional comparison with 10+ councils"],
    ["Publishable report", "A professional PDF you can share with residents, councillors, and stakeholders"],
    ["Score challenge process", "Challenge any indicator within 5 working days - with evidence review and transparent audit trail"],
    ["Subscriber portal", "Track your score, view recommendations, and manage your subscription online"],
    ["Money-back guarantee", "Gold: 30-day guarantee. Platinum: 60-day guarantee. No questions asked."],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 3, textColor: [...DARK] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42, textColor: [...TEAL] },
      1: { cellWidth: contentWidth - 42 },
    },
    body: benefits,
    didDrawPage: (data: any) => { lastFinalY = data.cursor?.y ?? y + 40; },
  });

  y = lastFinalY + 10;

  // Pricing summary
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, "F");
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, "S");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Subscription Plans", margin + 4, y + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text("Gold - GBP 390/year (+ VAT)", margin + 4, y + 16);
  doc.setTextColor(...SLATE);
  doc.setFontSize(7.5);
  doc.text("Annual report + 5 recommendations + peer comparison + subscriber portal + email support", margin + 4, y + 21);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEAL);
  doc.text("Platinum - GBP 690/year (+ VAT)  [Most popular]", margin + 4, y + 28);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.setFontSize(7.5);
  doc.text("Quarterly reports + 12 recommendations + full peer benchmarking + improvement roadmap + priority support", margin + 4, y + 33);

  y += 42;

  // Contact details
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Get in Touch", margin, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text("Email: info@councilclearsight.org.uk", margin, y);
  y += 5;
  doc.text("Resident enquiries: resident@councilclearsight.org.uk", margin, y);
  y += 5;
  doc.text("Website: www.councilclearsight.org.uk", margin, y);
  y += 10;

  // Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(...SLATE);
  const disclaimer = `This report is produced by Council ClearSight using publicly available data. All indicators are independently verifiable. Scores reflect data collected during the January-March 2026 assessment window and may not reflect changes made after 31 March 2026. The VDTI methodology (v2.0) is published in full at councilclearsight.org.uk/methodology. Council ClearSight is an independent assessment service and is not affiliated with any local authority, government department, or regulatory body. For queries about this report, please contact info@councilclearsight.org.uk.`;
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, y);

  addPageFooter(pageNum.value);

  // ─── Save ──────────────────────────────────────────────────────────────────
  const filename = `Council_ClearSight_Report_${council.name.replace(/[^a-zA-Z0-9]/g, "_")}_2026.pdf`;
  doc.save(filename);
}
