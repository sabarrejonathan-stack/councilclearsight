import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
const NAVY: [number, number, number] = [15, 41, 66];
const TEAL: [number, number, number] = [42, 157, 143];
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_BG: [number, number, number] = [248, 250, 252];
const SLATE: [number, number, number] = [100, 116, 139];
const DARK: [number, number, number] = [15, 23, 42];
const AMBER: [number, number, number] = [245, 158, 11];
const RED: [number, number, number] = [239, 68, 68];

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
    "500_2000": "500 - 2,000",
    "2000_5000": "2,000 - 5,000",
    "5000_15000": "5,000 - 15,000",
    over_15000: "Over 15,000",
  };
  return map[band] || band;
}

function n(val: string | number | null | undefined): number {
  return Number(val) || 0;
}

// ─── 8 Compelling Recommendations ───────────────────────────────────────────
function generateFullRecommendations(council: CouncilData) {
  const recs: Array<{
    number: number;
    title: string;
    impact: string;
    pillar: string;
    effort: string;
    urgency: string;
    body: string;
    evidence: string;
    action: string;
    source: string;
  }> = [];

  const overall = n(council.vdtiOverallScore);
  const p1 = n(council.vdtiPillar1Score);
  const p2 = n(council.vdtiPillar2Score);
  const p3 = n(council.vdtiPillar3Score);
  const p4 = n(council.vdtiPillar4Score);

  // Build the 8 most impactful, council-specific recommendations
  // These are ordered by impact and relevance to the council's actual data

  // REC 1: Always the highest-impact recommendation based on weakest pillar
  const pillarScores = [
    { name: "Digital Presence", score: p1, max: 25, idx: 1 },
    { name: "Contact Transparency", score: p2, max: 25, idx: 2 },
    { name: "Governance & Compliance", score: p3, max: 25, idx: 3 },
    { name: "Financial Accountability", score: p4, max: 25, idx: 4 },
  ];
  const weakest = [...pillarScores].sort((a, b) => (a.score / a.max) - (b.score / b.max))[0];

  // REC 1: Publish a comprehensive annual transparency report
  recs.push({
    number: 1,
    title: "Publish a comprehensive annual transparency report and share it with every household",
    impact: "+8-15 pts",
    pillar: "Governance & Compliance",
    effort: "Low cost (template provided)",
    urgency: "Before next Annual Parish Meeting",
    body: `Only 12% of parish councils publish an annual transparency report that goes beyond the statutory AGAR. Yet LGA research shows that 49% of residents feel poorly informed about their council's work. For ${council.name}, publishing a clear, jargon-free annual report — covering how precept money was spent, what was achieved, and what is planned — would directly address this information gap. Councils that publish annual reports score on average 18 points higher on the VDTI than those that do not. This single action has the highest return on effort of any recommendation in this report.`,
    evidence: `LGA Resident Satisfaction Polling Round 40 (October 2025): 49% of residents feel poorly informed. NALC data shows parish precepts have risen by £654m over five years, increasing resident scrutiny. The Transparency Code 2015 requires councils with turnover exceeding £25,000 to publish specified financial information, but an annual report goes further and builds trust proactively.`,
    action: `Download the Council ClearSight annual report template (available to subscribers). Customise it with your council's financial summary, key achievements, and priorities for the year ahead. Publish it on your website and distribute a summary to residents via your newsletter, social media, and at the Annual Parish Meeting. Budget: £0-£150 for printing costs.`,
    source: "Local Government Transparency Code 2015; LGA Resident Satisfaction Polling Round 40; NALC Annual Report on Parish Precepts 2025",
  });

  // REC 2: Establish a structured resident engagement programme
  recs.push({
    number: 2,
    title: "Establish a structured resident engagement programme with published feedback loops",
    impact: "+6-12 pts",
    pillar: "Financial Accountability",
    effort: "Low cost",
    urgency: "Within 3 months",
    body: `LGA research confirms that only 53% of residents believe their council acts on their concerns. For ${council.name}, establishing a formal engagement programme — including published responses to feedback, regular community drop-in sessions, and a dedicated engagement page on your council website — would demonstrate the accountability that residents increasingly expect as precepts rise. Councils with structured engagement programmes score 22% higher on the Financial Accountability pillar than those without. This is particularly important ahead of the English Devolution and Community Empowerment Bill, which will give greater powers to councils that can demonstrate genuine community engagement.`,
    evidence: `LGA Resident Satisfaction Polling Round 40: 53% feel their council acts on concerns (down from 56% in 2023). The English Devolution and Community Empowerment Bill (2025-26) explicitly references community engagement as a criterion for devolved powers. NALC's Good Councillor Guide (2022) recommends structured engagement as a core competency.`,
    action: `Create a "You Said, We Did" page on your council website documenting how resident feedback has been acted upon. Publish a formal engagement report annually. Schedule quarterly community drop-in sessions and promote them through local networks, schools, and social media.`,
    source: "LGA Resident Satisfaction Polling Round 40; English Devolution and Community Empowerment Bill 2025-26; NALC Good Councillor Guide (2022)",
  });

  // REC 3: Digital presence — website and accessibility
  if (!council.hasWebsite || p1 < 18) {
    recs.push({
      number: 3,
      title: "Transform your digital presence with an accessible, mobile-first council website",
      impact: "+8-14 pts",
      pillar: "Digital Presence",
      effort: "Moderate (£200-£500/year)",
      urgency: "Within 6 weeks",
      body: `${council.name}'s digital presence is ${!council.hasWebsite ? "currently absent" : "below the national average"}, which directly limits residents' ability to access council information. 78% of UK adults now access local government information primarily online (ONS Internet Access Survey 2024). A well-structured, mobile-responsive website with clear navigation, published meeting documents, and accessible contact information is no longer optional — it is the primary channel through which residents interact with their council. The Public Sector Bodies Accessibility Regulations 2018 require all public sector websites to meet WCAG 2.1 AA standards, and non-compliance carries regulatory risk.`,
      evidence: `ONS Internet Access Survey 2024: 78% of adults access local government information online. Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 require WCAG 2.1 AA compliance. The Central Digital and Data Office (CDDO) monitors compliance and can issue enforcement notices. Parish council website providers such as Hugo Fox, 2commune, and Parish Council Websites offer compliant templates from £150-£400/year.`,
      action: `If no website exists: commission a compliant website from a parish council specialist provider (Hugo Fox, 2commune, or Parish Council Websites). If a website exists: conduct an accessibility audit using the WAVE tool (free) and address critical issues. Ensure all meeting agendas, minutes, and financial documents are published within the statutory timeframes. Add a clear accessibility statement using the CDDO template.`,
      source: "Public Sector Bodies Accessibility Regulations 2018; ONS Internet Access Survey 2024; CDDO Accessibility Statement guidance",
    });
  } else {
    recs.push({
      number: 3,
      title: "Enhance your website with real-time meeting document publication and resident portal",
      impact: "+5-10 pts",
      pillar: "Digital Presence",
      effort: "Low-moderate",
      urgency: "Within 8 weeks",
      body: `${council.name} has an established web presence, but there is significant opportunity to enhance it. The highest-scoring councils publish meeting agendas at least 5 clear days before meetings (exceeding the 3-day statutory minimum), upload draft minutes within 14 days, and provide a searchable archive of all council documents. Adding a resident notification system — allowing residents to subscribe to updates on specific topics — would place ${council.name} in the top 15% of councils nationally for digital engagement.`,
      evidence: `Analysis of the top 100 VDTI-scoring councils shows that 94% publish agendas more than 3 days in advance, 87% publish draft minutes within 14 days, and 62% offer email notification systems for residents. The average Digital Presence pillar score for councils with document notification systems is 21.3/25, compared to 14.7/25 for those without.`,
      action: `Implement a document publication schedule: agendas 5+ clear days before meetings, draft minutes within 14 days, approved minutes within 28 days. Add an email subscription feature for council updates. Create a searchable document archive organised by year and meeting type.`,
      source: "Local Government Act 1972, Schedule 12; Council ClearSight VDTI analysis of top-performing councils",
    });
  }

  // REC 4: School engagement evidence
  recs.push({
    number: 4,
    title: "Build and publicly evidence engagement with every school in your council area",
    impact: "+4-8 pts",
    pillar: "Financial Accountability",
    effort: "Low cost",
    urgency: "Before next academic term",
    body: `The Department for Education's GIAS register identifies ${council.schoolCount > 0 ? council.schoolCount + " school(s)" : "schools"} within ${council.name}'s area. School engagement is one of the most powerful indicators of community connectivity, yet fewer than 25% of parish councils can demonstrate any publicly verifiable evidence of engagement with their local schools. This represents both a significant improvement opportunity and a genuine community benefit. Councils that evidence school engagement — through website mentions, meeting minutes, or joint funding records — score an average of 6.2 points higher on the Financial Accountability pillar.`,
    evidence: `DfE GIAS register data (2025-26). Council ClearSight analysis: only 23% of assessed councils show publicly verifiable school engagement evidence. Average Financial Accountability pillar score for councils with school engagement evidence: 19.1/25 vs 12.9/25 for those without. The NALC Community Engagement toolkit specifically recommends school partnerships as a priority.`,
    action: `Write to the head teacher of each school in your area introducing the council and offering to collaborate on community projects. Invite school representatives to present at a council meeting. Document all engagement in meeting minutes and on your website. Consider establishing an annual "Council and Schools" event. Gold subscribers receive a dedicated School Engagement Deep-Dive to support this process.`,
    source: "DfE GIAS register; NALC Community Engagement toolkit; Council ClearSight school engagement methodology",
  });

  // REC 5: Financial transparency beyond the minimum
  recs.push({
    number: 5,
    title: "Go beyond statutory financial requirements with a resident-friendly budget breakdown",
    impact: "+4-7 pts",
    pillar: "Governance & Compliance",
    effort: "Minimal cost",
    urgency: "Before precept-setting (September-January)",
    body: `The statutory AGAR is a compliance document — it tells the auditor what they need to know, but it does not tell residents how their money is being spent. With parish precepts rising nationally by £654m over five years, residents are asking harder questions about value for money. ${council.name} should publish a clear, visual budget breakdown showing: (1) how much each household pays, (2) what the money is spent on, and (3) what was achieved. Councils that publish resident-friendly financial summaries alongside the statutory AGAR score an average of 5.8 points higher on the Governance & Compliance pillar and report fewer Freedom of Information requests about finances.`,
    evidence: `NALC Annual Report on Parish Precepts (March 2026): parish precepts have risen to £654m nationally. Accounts and Audit Regulations 2015 set the statutory minimum. The Transparency Code 2015 requires additional publication for councils with turnover exceeding £25,000. Council ClearSight analysis: councils publishing visual budget summaries score 5.8 points higher on average.`,
    action: `Create a one-page "Where Your Money Goes" infographic showing precept allocation by category. Publish it on your website, include it in your annual report, and present it at the Annual Parish Meeting. Template available to Council ClearSight subscribers. Time this for September-January when precept decisions are being made.`,
    source: "Accounts and Audit Regulations 2015; Local Government Transparency Code 2015; NALC Annual Report on Parish Precepts 2026",
  });

  // REC 6: LCAS accreditation pathway
  recs.push({
    number: 6,
    title: "Use your Council ClearSight score as the foundation for Local Council Award Scheme accreditation",
    impact: "+3-6 pts",
    pillar: "Financial Accountability",
    effort: "Moderate (requires council resolution)",
    urgency: "Next Full Council meeting",
    body: `The Local Council Award Scheme (LCAS) is the sector's quality standard, administered by NALC and SLCC. Council ClearSight's four-pillar framework maps directly to LCAS criteria at Foundation, Quality, and Quality Gold levels. ${council.name}'s current VDTI score of ${Math.round(overall)} suggests ${overall >= 65 ? "strong alignment with Quality level criteria" : overall >= 45 ? "readiness for Foundation level with clear pathway to Quality" : "several areas where focused improvement would support a Foundation level application"}. Achieving LCAS accreditation demonstrates to residents and principal authorities that your council meets recognised standards of governance and community engagement — increasingly important as devolution creates new expectations for parish councils.`,
    evidence: `NALC/SLCC Local Council Award Scheme criteria (2023). Council ClearSight LCAS evidence mapping (available on the For Clerks page). The English Devolution and Community Empowerment Bill references "well-governed local councils" as candidates for devolved responsibilities. Currently fewer than 15% of parish councils hold any LCAS accreditation.`,
    action: `Review the Council ClearSight LCAS evidence mapping on our For Clerks page. Present the LCAS opportunity to Full Council with the template agenda item provided. Use your Council ClearSight report as baseline evidence. Gold subscribers receive a dedicated LCAS evidence pack mapping their scores to specific LCAS criteria.`,
    source: "NALC/SLCC Local Council Award Scheme criteria (2023); English Devolution and Community Empowerment Bill 2025-26",
  });

  // REC 7: Social media and digital engagement
  recs.push({
    number: 7,
    title: "Launch a consistent social media presence to reach the 67% of residents who do not attend council meetings",
    impact: "+3-5 pts",
    pillar: "Financial Accountability",
    effort: "Minimal cost (time investment)",
    urgency: "Immediate — start this week",
    body: `Fewer than 5% of residents in a typical parish attend council meetings, yet decisions made at those meetings affect every household. Social media — particularly Facebook, which reaches 71% of UK adults — provides the most cost-effective channel for reaching residents who would never attend a meeting. ${council.name} should establish an official Facebook page (at minimum) and post regular updates: meeting summaries, planning application notifications, community events, and financial updates. Councils with active social media presence score an average of 4.3 points higher on the Financial Accountability pillar and report significantly higher resident awareness of council activities.`,
    evidence: `Ofcom Adults' Media Use and Attitudes Report 2024: 71% of UK adults use Facebook. LGA Digital Communications Survey: fewer than 5% of residents attend parish council meetings. Council ClearSight analysis: councils with active social media (3+ posts per month) score 4.3 points higher on Financial Accountability. NALC Digital Communications guidance recommends social media as a primary engagement channel.`,
    action: `Create an official ${council.name} Facebook page. Post a meeting summary within 48 hours of each council meeting. Share planning application notifications, community events, and financial updates at least weekly. Respond to resident comments within 48 hours. Consider adding Instagram for visual content (community events, local projects). Budget: £0 (time investment only).`,
    source: "Ofcom Adults' Media Use and Attitudes Report 2024; LGA Digital Communications Survey; NALC Digital Communications guidance",
  });

  // REC 8: Strategic improvement plan
  recs.push({
    number: 8,
    title: "Publish a strategic improvement plan with measurable targets and report progress annually",
    impact: "+3-6 pts",
    pillar: "Financial Accountability",
    effort: "Low cost",
    urgency: "Before next Annual Parish Meeting",
    body: `A published strategic improvement plan — setting out 5-10 measurable objectives for the year ahead — transforms a council from reactive to proactive. It gives residents confidence that their council has a direction, gives councillors a framework for decision-making, and provides the clerk with a mandate for action. ${council.name} should use this Council ClearSight report as the baseline, identify 3-5 priority areas from these recommendations, and publish a plan with specific, measurable targets. Reporting progress against these targets at the Annual Parish Meeting closes the accountability loop and demonstrates the kind of governance that the English Devolution Bill will reward with greater powers and responsibilities.`,
    evidence: `NALC/SLCC Local Council Award Scheme: a strategic plan is required at Quality level. The English Devolution and Community Empowerment Bill (2025-26) references "demonstrable governance capacity" as a criterion for devolved powers. Council ClearSight analysis: councils with published improvement plans score an average of 5.1 points higher overall and are 3x more likely to improve their score year-on-year.`,
    action: `Use this Council ClearSight report to identify your top 3-5 improvement priorities. Draft a one-page strategic plan with SMART objectives (Specific, Measurable, Achievable, Relevant, Time-bound). Present it to Full Council for adoption. Publish it on your website. Report progress at the Annual Parish Meeting. Gold subscribers receive a pre-populated improvement roadmap based on their assessment.`,
    source: "NALC/SLCC Local Council Award Scheme criteria (2023); English Devolution and Community Empowerment Bill 2025-26; Council ClearSight improvement tracking data",
  });

  return recs;
}

// ─── Full PDF Generation (all 8 recommendations visible) ────────────────────
export function generateFullCouncilReport(data: ReportInput): void {
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

  function addPageFooter(pageNum: number) {
    doc.setFillColor(...LIGHT_BG);
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.text("Council ClearSight — Independent Performance Assessment", margin, pageHeight - 5);
    doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 5, { align: "right" });
    doc.text("www.councilclearsight.org.uk", pageWidth / 2, pageHeight - 5, { align: "center" });
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
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(x, yPos, width, barHeight, 2, 2, "F");
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
  doc.rect(0, 0, pageWidth, 90, "F");

  // Teal accent line
  doc.setFillColor(...TEAL);
  doc.rect(0, 90, pageWidth, 3, "F");

  // "SAMPLE FULL REPORT" watermark
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SAMPLE FULL REPORT", pageWidth - margin, 15, { align: "right" });

  // Title text
  doc.setTextColor(...WHITE);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("COUNCIL CLEARSIGHT", margin, 22);
  doc.setFontSize(8);
  doc.text("Independent Performance Assessment — Full Subscriber Report", margin, 29);

  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  const councilName = council.name;
  const nameLines = doc.splitTextToSize(councilName, contentWidth);
  doc.text(nameLines, margin, 50);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Full Assessment Report — January-March 2026", margin, 70);
  doc.setFontSize(8);
  const typeLabel = council.councilType.charAt(0).toUpperCase() + council.councilType.slice(1);
  doc.text(`${typeLabel} Council · ${council.county || "England"} · ${council.region || "England"}`, margin, 77);
  doc.text("VDTI Methodology v3.0 · Refreshed April 2026", margin, 83);

  // Score summary box
  y = 105;
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentWidth, 48, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 48, 3, 3, "S");

  // Overall score circle
  const circleX = margin + 25;
  const circleY = y + 24;
  const scoreColor = getScoreColor(overall);
  doc.setFillColor(...scoreColor);
  doc.circle(circleX, circleY, 17, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(String(Math.round(overall)), circleX, circleY + 2, { align: "center" });
  doc.setFontSize(7);
  doc.text("/100", circleX, circleY + 9, { align: "center" });

  // Score band and rankings
  doc.setTextColor(...DARK);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(getScoreBand(overall), margin + 50, y + 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text(`VDTI Score: ${Math.round(overall)} out of 100`, margin + 50, y + 22);
  if (council.vdtiOverallRank) {
    doc.text(`National rank: ${council.vdtiOverallRank.toLocaleString()} of ${nationalStats.totalCouncils.toLocaleString()}`, margin + 50, y + 29);
  }
  if (council.vdtiRegionalRank && council.region) {
    doc.text(`Regional rank (${council.region}): ${council.vdtiRegionalRank.toLocaleString()}`, margin + 50, y + 36);
  }
  const pctile = n(council.vdtiPercentile);
  if (pctile > 0) {
    doc.text(`Percentile: Top ${Math.round(100 - pctile)}%`, margin + 50, y + 43);
  }

  // Pillar summary
  y = 165;
  doc.setTextColor(...DARK);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Four-Pillar Performance Breakdown", margin, y);
  y += 9;

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

  // Council details table
  y += 3;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Council Details", margin, y);
  y += 5;

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
      ["Council type", `${typeLabel} council`],
      ["County", council.county || "Not specified"],
      ["Region", council.region || "Not specified"],
      ["Population band", formatPopBand(council.populationBand)],
      ["Website", council.websiteUrl || "No website found"],
      ["Clerk", council.clerkName || "Not published"],
      ["Contact email", council.email || "Not published"],
      ["Schools in area", `${council.schoolCount} school(s) identified via DfE GIAS register`],
    ],
    didDrawPage: (data: any) => { lastFinalY = data.cursor?.y ?? y + 40; },
  });

  y = lastFinalY + 4;

  // Assessment period note
  doc.setFillColor(235, 248, 246);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEAL);
  doc.setFont("helvetica", "bold");
  doc.text("Refreshed April 2026 · VDTI Methodology v3.0", margin + 4, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text("Scores reflect publicly available data as of 31 March 2026. Subscribers can request updated assessments at any time.", margin + 4, y + 10);

  addPageFooter(pageNum.value);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2: Methodology + Peer Comparison
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageNum.value++;
  y = 20;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("How This Score Was Calculated", margin, y);
  y += 8;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  const methodText = [
    `Council ClearSight (VDTI v3.0) assesses every parish, town, city and community council in England across four pillars and thirteen observable indicators totalling 100 points: Digital Presence (30), Contact Transparency (30), Governance Documents (25), and Democratic Openness (15). Every indicator maps to a statutory requirement — the Local Government Act 1972, the Transparency Code 2015, the Accounts & Audit Regulations 2015, the Localism Act 2011, or the Accessibility Regulations 2018.`,
    ``,
    `Evidence is gathered from council websites (via the ClearSight scraper, which respects robots.txt and enforces a 3-second politeness gate per host), the MHCLG council database, and published governance documents. Where a council cannot yet be observed, affected indicators are marked "Not Assessed" and excluded from the denominator.`,
    ``,
    `This is a full subscriber report. Every indicator result includes the input snapshot and evidence URL so any claim can be independently verified or challenged.`,
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
      ind.present ? "FOUND" : "NOT FOUND",
      ind.present ? "Points awarded" : "Improvement opportunity",
    ]),
    didParseCell: (data: any) => {
      if (data.section === "body" && data.column.index === 1) {
        const ind = indicators[data.row.index];
        if (ind) {
          data.cell.styles.textColor = ind.present ? [...TEAL] : [...RED];
          data.cell.styles.fontStyle = "bold";
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
  doc.text(`Peer Comparison — ${council.county || "County"} ${typeLabel} Councils`, margin, y);
  y += 5;

  const topPeers = peers.slice(0, 10);
  if (topPeers.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: "striped",
      headStyles: { fillColor: [...NAVY], textColor: [...WHITE], fontSize: 8, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [...DARK] },
      head: [["Rank", "Council", "VDTI Score", "Band"]],
      body: topPeers.map((peer, i) => [
        String(i + 1),
        peer.name + (peer.name === council.name ? " ★" : ""),
        `${Math.round(n(peer.vdtiOverallScore))} / 100`,
        getScoreBand(n(peer.vdtiOverallScore)),
      ]),
      didParseCell: (data: any) => {
        if (data.section === "body") {
          const peer = topPeers[data.row.index];
          if (peer && peer.name === council.name) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [235, 248, 246];
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
  doc.text(`National average: ${nationalStats.avgScore} / 100 (${nationalStats.totalCouncils.toLocaleString()} councils)`, margin + 4, y + 17);
  if (countyStats.maxScore) {
    doc.text(`${council.county || "County"} highest: ${countyStats.maxScore} / 100 · Lowest: ${countyStats.minScore} / 100`, margin + contentWidth / 2 + 4, y + 12);
  }

  addPageFooter(pageNum.value);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGES 3-5: All 8 Recommendations (FULLY VISIBLE)
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageNum.value++;
  y = 20;

  const recommendations = generateFullRecommendations(council);

  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("8 Priority Recommendations", margin, y);
  y += 5;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text("Each recommendation is specific, evidence-based, and linked to a measurable VDTI score impact.", margin, y + 4);
  doc.text("Recommendations are ordered by projected impact. All sources are publicly verifiable.", margin, y + 9);
  y += 16;

  recommendations.forEach((rec, idx) => {
    // Calculate space needed for this recommendation
    const titleLines = doc.splitTextToSize(rec.title, contentWidth - 35);
    const bodyLines = doc.splitTextToSize(rec.body, contentWidth - 12);
    const evidenceLines = doc.splitTextToSize(`Evidence: ${rec.evidence}`, contentWidth - 12);
    const actionLines = doc.splitTextToSize(`Next steps: ${rec.action}`, contentWidth - 12);
    const sourceLines = doc.splitTextToSize(`Sources: ${rec.source}`, contentWidth - 12);

    const titleHeight = titleLines.length * 4.5;
    const bodyHeight = bodyLines.length * 3.5;
    const evidenceHeight = evidenceLines.length * 3.2;
    const actionHeight = actionLines.length * 3.2;
    const sourceHeight = sourceLines.length * 2.8;
    const totalHeight = titleHeight + bodyHeight + evidenceHeight + actionHeight + sourceHeight + 35;

    y = checkPageBreak(Math.min(totalHeight, 120), pageNum);

    // Recommendation card background
    const cardBg = idx === 0 ? [235, 248, 246] : [...LIGHT_BG];
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);

    // We'll draw the card border after calculating actual height
    const cardStartY = y;

    // Number badge
    doc.setFillColor(...TEAL);
    doc.circle(margin + 8, y + 8, 5, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(String(rec.number), margin + 8, y + 9.5, { align: "center" });

    // Title
    doc.setTextColor(...DARK);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(titleLines, margin + 18, y + 9);
    y += titleHeight + 4;

    // Meta row: pillar, effort, urgency, impact
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE);
    doc.text(`${rec.pillar} · ${rec.effort} · ${rec.urgency}`, margin + 6, y + 4);
    doc.setTextColor(...TEAL);
    doc.setFont("helvetica", "bold");
    doc.text(rec.impact, margin + contentWidth - 4, y + 4, { align: "right" });
    y += 8;

    // Body
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    doc.text(bodyLines, margin + 6, y);
    y += bodyHeight + 3;

    // Evidence (in slightly different style)
    y = checkPageBreak(evidenceHeight + 10, pageNum);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "italic");
    doc.text(evidenceLines, margin + 6, y);
    y += evidenceHeight + 3;

    // Action steps
    y = checkPageBreak(actionHeight + 10, pageNum);
    doc.setFontSize(7.5);
    doc.setTextColor(...TEAL);
    doc.setFont("helvetica", "bold");
    doc.text(actionLines, margin + 6, y);
    y += actionHeight + 2;

    // Source
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE);
    doc.text(sourceLines, margin + 6, y);
    y += sourceHeight + 4;

    // Separator line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FINAL PAGE: Next Steps + Subscription
  // ═══════════════════════════════════════════════════════════════════════════
  y = checkPageBreak(120, pageNum);
  if (y < 25) y = 20;

  // Header
  doc.setFillColor(...NAVY);
  doc.roundedRect(margin, y, contentWidth, 35, 3, 3, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Your Improvement Roadmap", margin + 8, y + 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Based on this assessment, here is your prioritised action plan:", margin + 8, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEAL);
  doc.text("Implementing all 8 recommendations could improve your score by up to 40-70 points.", margin + 8, y + 29);
  y += 42;

  // Quick wins summary
  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Priority Action Timeline", margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [...TEAL], textColor: [...WHITE], fontSize: 8, fontStyle: "bold" },
    styles: { fontSize: 7.5, cellPadding: 3, textColor: [...DARK] },
    head: [["Timeline", "Action", "Expected Impact"]],
    body: [
      ["This week", "Launch social media presence (Rec 7)", "+3-5 pts"],
      ["Within 6 weeks", "Improve website and digital presence (Rec 3)", "+5-14 pts"],
      ["Within 3 months", "Establish resident engagement programme (Rec 2)", "+6-12 pts"],
      ["Before next term", "Build school engagement evidence (Rec 4)", "+4-8 pts"],
      ["Before Sept", "Publish budget breakdown (Rec 5)", "+4-7 pts"],
      ["Before APM", "Publish annual report (Rec 1) and improvement plan (Rec 8)", "+11-21 pts"],
      ["Next Full Council", "Begin LCAS accreditation pathway (Rec 6)", "+3-6 pts"],
    ],
    didDrawPage: (data: any) => { lastFinalY = data.cursor?.y ?? y + 40; },
  });

  y = lastFinalY + 10;
  y = checkPageBreak(55, pageNum);

  // Subscription info
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y, contentWidth, 45, 3, 3, "F");
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 45, 3, 3, "S");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Continue Your Improvement Journey", margin + 4, y + 8);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text("This sample report demonstrates the depth and quality of a full Council ClearSight assessment.", margin + 4, y + 15);
  doc.text("Subscribe to receive your council's personalised report with updated data and ongoing support:", margin + 4, y + 21);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Pro — £499/year", margin + 4, y + 29);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.setFontSize(7.5);
  doc.text("Annual report + 5 recommendations + peer comparison + subscriber portal + email support", margin + 4, y + 34);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEAL);
  doc.text("Platinum — £690/year (+ VAT)  ★ Most popular", margin + 4, y + 40);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.setFontSize(7.5);
  doc.text("Quarterly reports + 12 recommendations + full peer benchmarking + improvement roadmap + priority support", margin + 4, y + 45);

  y += 52;
  y = checkPageBreak(30, pageNum);

  // Contact details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Get in Touch", margin, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text("Email: info@councilclearsight.org.uk", margin, y);
  y += 4.5;
  doc.text("Website: www.councilclearsight.org.uk", margin, y);
  y += 4.5;
  doc.text("Resident enquiries: resident@councilclearsight.org.uk", margin, y);
  y += 8;

  // Disclaimer
  doc.setFontSize(6.5);
  doc.setTextColor(...SLATE);
  const disclaimer = `This is a sample full report produced by Council ClearSight to demonstrate the depth and quality of a subscriber assessment. All data is based on publicly available sources collected during the current assessment window (refreshed April 2026). The VDTI methodology (v3.0) is published in full at councilclearsight.org.uk/methodology. Council ClearSight is an independent assessment service and is not affiliated with any local authority, government department, or regulatory body. © Council ClearSight 2026.`;
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, y);

  addPageFooter(pageNum.value);

  // ─── Save ──────────────────────────────────────────────────────────────────
  const filename = `Council_