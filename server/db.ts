import { and, asc, desc, eq, gte, ilike, isNotNull, lte, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  adminLogs,
  benchmarkScores,
  blogPosts,
  councilMembers,
  councils,
  demoRequests,
  InsertUser,
  interestRegistrations,
  newsletterSubscribers,
  recommendations,
  reports,
  subscriptions,
  surveyResponses,
  surveys,
  surveyTemplates,
  sampleReportLeads,
  scoreChallenges,
  snapshotRequests,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Councils ─────────────────────────────────────────────────────────────────
export async function getCouncils(opts?: {
  search?: string;
  county?: string;
  region?: string;
  councilType?: string;
  populationBand?: string;
  scoreMin?: number;
  scoreMax?: number;
  sortBy?: 'name' | 'rank' | 'score';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(councils.isPublic, true)];
  if (opts?.search) {
    conditions.push(sql`LOWER(${councils.name}) LIKE LOWER(${'%' + opts.search + '%'})`);
  }
  if (opts?.county) conditions.push(eq(councils.county, opts.county));
  if (opts?.region) conditions.push(eq(councils.region, opts.region));
  if (opts?.councilType) conditions.push(eq(councils.councilType, opts.councilType as any));
  if (opts?.populationBand) conditions.push(eq(councils.populationBand, opts.populationBand as any));
  if (opts?.scoreMin !== undefined) conditions.push(gte(councils.vdtiOverallScore, String(opts.scoreMin)));
  if (opts?.scoreMax !== undefined) conditions.push(lte(councils.vdtiOverallScore, String(opts.scoreMax)));
  const sortCol = opts?.sortBy === 'rank' || opts?.sortBy === 'score'
    ? desc(councils.vdtiOverallScore)
    : asc(councils.name);
  return db
    .select()
    .from(councils)
    .where(and(...conditions))
    .orderBy(sortCol)
    .limit(opts?.limit ?? 50)
    .offset(opts?.offset ?? 0);
}

export async function getCouncilsCount(opts?: {
  search?: string;
  county?: string;
  region?: string;
  councilType?: string;
  scoreMin?: number;
  scoreMax?: number;
}) {
  const db = await getDb();
  if (!db) return 0;
  const conditions = [eq(councils.isPublic, true)];
  if (opts?.search) conditions.push(sql`LOWER(${councils.name}) LIKE LOWER(${'%' + opts.search + '%'})`);
  if (opts?.county) conditions.push(eq(councils.county, opts.county));
  if (opts?.region) conditions.push(eq(councils.region, opts.region));
  if (opts?.councilType) conditions.push(eq(councils.councilType, opts.councilType as any));
  if (opts?.scoreMin !== undefined) conditions.push(gte(councils.vdtiOverallScore, String(opts.scoreMin)));
  if (opts?.scoreMax !== undefined) conditions.push(lte(councils.vdtiOverallScore, String(opts.scoreMax)));
  const result = await db.select({ count: sql<number>`count(*)` }).from(councils).where(and(...conditions));
  return Number(result[0]?.count ?? 0);
}

export async function getRegionalStats() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      region: councils.region,
      count: sql<number>`count(*)`,
      avgScore: sql<number>`avg(vdtiOverallScore)`,
      minScore: sql<number>`min(vdtiOverallScore)`,
      maxScore: sql<number>`max(vdtiOverallScore)`,
    })
    .from(councils)
    .where(and(eq(councils.isPublic, true), isNotNull(councils.vdtiOverallScore)))
    .groupBy(councils.region)
    .orderBy(desc(sql`avg(vdtiOverallScore)`));
}

export async function getCouncilBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(councils).where(eq(councils.slug, slug)).limit(1);
  return result[0];
}

export async function getCouncilById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(councils).where(eq(councils.id, id)).limit(1);
  return result[0];
}

export async function getAllCouncils() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(councils).orderBy(councils.name);
}

export async function upsertCouncil(data: any) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(councils).set(data).where(eq(councils.id, data.id));
  } else {
    await db.insert(councils).values(data);
  }
}

// ─── Benchmark Scores ─────────────────────────────────────────────────────────
export async function getBenchmarkScores(councilId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(benchmarkScores)
    .where(eq(benchmarkScores.councilId, councilId))
    .orderBy(desc(benchmarkScores.calculatedAt));
}

export async function getLatestBenchmarkScore(councilId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(benchmarkScores)
    .where(eq(benchmarkScores.councilId, councilId))
    .orderBy(desc(benchmarkScores.calculatedAt))
    .limit(1);
  return result[0];
}

export async function insertBenchmarkScore(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(benchmarkScores).values(data);
}

// ─── Surveys ──────────────────────────────────────────────────────────────────
export async function getSurveysByCouncil(councilId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(surveys)
    .where(eq(surveys.councilId, councilId))
    .orderBy(desc(surveys.createdAt));
}

export async function getSurveyBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(surveys).where(eq(surveys.slug, slug)).limit(1);
  return result[0];
}

export async function getSurveyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(surveys).where(eq(surveys.id, id)).limit(1);
  return result[0];
}

export async function insertSurvey(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(surveys).values(data);
}

export async function updateSurvey(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(surveys).set(data).where(eq(surveys.id, id));
}

// ─── Survey Responses ─────────────────────────────────────────────────────────
export async function insertSurveyResponse(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(surveyResponses).values(data);
  await db
    .update(surveys)
    .set({ responseCount: sql`${surveys.responseCount} + 1` })
    .where(eq(surveys.id, data.surveyId));
}

export async function getSurveyResponses(surveyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(surveyResponses).where(eq(surveyResponses.surveyId, surveyId));
}

// ─── Survey Templates ─────────────────────────────────────────────────────────
export async function getSurveyTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(surveyTemplates).orderBy(surveyTemplates.name);
}

// ─── Recommendations ──────────────────────────────────────────────────────────
export async function getRecommendations(councilId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(recommendations)
    .where(and(eq(recommendations.councilId, councilId), eq(recommendations.status, "approved")))
    .orderBy(recommendations.priority, desc(recommendations.createdAt));
}

export async function getAllRecommendations(councilId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(recommendations)
    .where(eq(recommendations.councilId, councilId))
    .orderBy(desc(recommendations.createdAt));
}

export async function insertRecommendation(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(recommendations).values(data);
}

export async function updateRecommendation(id: number, data: any) {
  const db = await getDb();
  if (!db) return;
  await db.update(recommendations).set(data).where(eq(recommendations.id, id));
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export async function getReports(councilId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(reports)
    .where(eq(reports.councilId, councilId))
    .orderBy(desc(reports.createdAt));
}

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export async function getBlogPosts(opts?: { limit?: number; category?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(blogPosts.isPublished, true)];
  if (opts?.category) conditions.push(eq(blogPosts.category, opts.category));
  return db
    .select()
    .from(blogPosts)
    .where(and(...conditions))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(opts?.limit ?? 20);
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result[0];
}

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
}

export async function upsertBlogPost(data: any) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(blogPosts).set(data).where(eq(blogPosts.id, data.id));
  } else {
    await db.insert(blogPosts).values(data);
  }
}

// ─── Demo Requests ────────────────────────────────────────────────────────────
export async function insertDemoRequest(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(demoRequests).values(data);
}

export async function getDemoRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(demoRequests).orderBy(desc(demoRequests.createdAt));
}

/// ─── Interest Registrations ─────────────────────────────────────────────────
export async function insertInterestRegistration(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(interestRegistrations).values(data);
}

export async function getInterestRegistrations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interestRegistrations).orderBy(desc(interestRegistrations.createdAt));
}

// ─── Newsletter Subscribers ─────────────────────────────────────────────────
export async function insertNewsletterSubscriber(data: any) {
  const db = await getDb();
  if (!db) return { alreadySubscribed: false };
  try {
    await db.insert(newsletterSubscribers).values(data);
    return { alreadySubscribed: false };
  } catch (e: any) {
    if (e?.code === 'ER_DUP_ENTRY') return { alreadySubscribed: true };
    throw e;
  }
}

export async function getNewsletterSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
}

// ─── Admin Logs ────────────────────────────────────────────────────────────
export async function insertAdminLog(data: any) {
  const db = await getDb();
  if (!db) return;
  await db.insert(adminLogs).values(data);
}

export async function getAdminLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt)).limit(limit);
}

// ─── Council Members ──────────────────────────────────────────────────────────
export async function getCouncilMembersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(councilMembers).where(eq(councilMembers.userId, userId));
}

export async function getCouncilMembersForCouncil(councilId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(councilMembers).where(eq(councilMembers.councilId, councilId));
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function getSubscription(councilId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.councilId, councilId))
    .limit(1);
  return result[0];
}

// ─── Admin stats ──────────────────────────────────────────────────────────────
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalCouncils: 0, activeSubscriptions: 0, totalSurveys: 0, totalResponses: 0 };
  const [councilCount] = await db.select({ count: sql<number>`count(*)` }).from(councils);
  const [activeSubCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));
  const [surveyCount] = await db.select({ count: sql<number>`count(*)` }).from(surveys);
  const [responseCount] = await db.select({ count: sql<number>`count(*)` }).from(surveyResponses);
  return {
    totalCouncils: Number(councilCount?.count ?? 0),
    activeSubscriptions: Number(activeSubCount?.count ?? 0),
    totalSurveys: Number(surveyCount?.count ?? 0),
    totalResponses: Number(responseCount?.count ?? 0),
  };
}

// ─── Score Challenges ─────────────────────────────────────────────────────────
export async function insertScoreChallenge(data: {
  councilId: number;
  councilName: string;
  submitterName: string;
  submitterEmail: string;
  submitterRole?: string;
  challengedPillar?: string;
  reason: string;
  evidenceUrl?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(scoreChallenges).values({
    councilId: data.councilId,
    councilName: data.councilName,
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail,
    submitterRole: data.submitterRole ?? null,
    challengedPillar: data.challengedPillar ?? null,
    reason: data.reason,
    evidenceUrl: data.evidenceUrl ?? null,
    status: "pending",
  });
}

export async function getScoreChallenges(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(scoreChallenges)
    .orderBy(desc(scoreChallenges.createdAt))
    .limit(limit);
}

export async function insertSnapshotRequest(data: {
  email: string;
  councilId?: number;
  councilName: string;
  councilSlug?: string;
  vdtiScore?: number;
  pillar1Score?: number;
  pillar2Score?: number;
  pillar3Score?: number;
  pillar4Score?: number;
  nationalRank?: number;
  totalCouncils?: number;
  pdfUrl?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(snapshotRequests).values({
    email: data.email,
    councilId: data.councilId ?? null,
    councilName: data.councilName,
    councilSlug: data.councilSlug ?? null,
    vdtiScore: data.vdtiScore ?? null,
    pillar1Score: data.pillar1Score ?? null,
    pillar2Score: data.pillar2Score ?? null,
    pillar3Score: data.pillar3Score ?? null,
    pillar4Score: data.pillar4Score ?? null,
    nationalRank: data.nationalRank ?? null,
    totalCouncils: data.totalCouncils ?? null,
    pdfUrl: data.pdfUrl ?? null,
  });
}

// ─── Counties ────────────────────────────────────────────────────────────────
export async function getCounties() {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      county: councils.county,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(councils)
    .where(eq(councils.isPublic, true))
    .groupBy(councils.county)
    .orderBy(asc(councils.county));
  return result;
}

// ─── Contact Enquiries ───────────────────────────────────────────────────────
export async function insertContactEnquiry(data: {
  name: string;
  email: string;
  phone?: string;
  councilName?: string;
  role?: string;
  subject: string;
  message: string;
  source?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(interestRegistrations).values({
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    councilName: data.councilName || "Not specified",
    role: data.role ?? null,
    source: `contact_form:${data.subject}:${data.message.substring(0, 500)}`,
    status: "new",
  });
}

// ─── Dynamic Report Data ─────────────────────────────────────────────────────
export async function getCouncilReportData(councilId: number) {
  const db = await getDb();
  if (!db) return null;

  const [council] = await db
    .select()
    .from(councils)
    .where(eq(councils.id, councilId))
    .limit(1);

  if (!council) return null;

  // Get peer councils (same county, same type)
  const peers = await db
    .select({
      name: councils.name,
      vdtiOverallScore: councils.vdtiOverallScore,
      vdtiPillar1Score: councils.vdtiPillar1Score,
      vdtiPillar2Score: councils.vdtiPillar2Score,
      vdtiPillar3Score: councils.vdtiPillar3Score,
      vdtiPillar4Score: councils.vdtiPillar4Score,
    })
    .from(councils)
    .where(
      and(
        council.county ? eq(councils.county, council.county) : sql`1=1`,
        council.councilType ? eq(councils.councilType, council.councilType) : sql`1=1`,
        eq(councils.isPublic, true)
      )
    )
    .orderBy(desc(councils.vdtiOverallScore))
    .limit(20);

  // Get county stats
  const [countyStats] = await db
    .select({
      avgScore: sql<number>`ROUND(AVG(vdtiOverallScore), 1)`.as("avgScore"),
      maxScore: sql<number>`MAX(vdtiOverallScore)`.as("maxScore"),
      minScore: sql<number>`MIN(vdtiOverallScore)`.as("minScore"),
      totalCouncils: sql<number>`COUNT(*)`.as("totalCouncils"),
    })
    .from(councils)
    .where(council.county ? eq(councils.county, council.county) : sql`1=1`);

  // Get national stats
  const [nationalStats] = await db
    .select({
      avgScore: sql<number>`ROUND(AVG(vdtiOverallScore), 1)`.as("avgScore"),
      totalCouncils: sql<number>`COUNT(*)`.as("totalCouncils"),
    })
    .from(councils);

  return {
    council,
    peers,
    countyStats,
    nationalStats,
  };
}

// ─── Sample Report Leads ──────────────────────────────────────────────────────
export async function insertSampleReportLead(data: {
  firstName: string;
  lastName: string;
  email: string;
  councilId: number;
  councilSlug: string;
  councilName: string;
  role: "clerk" | "rfo" | "chair" | "councillor" | "officer" | "resident" | "press" | "other";
  phone?: string;
  marketingConsent: boolean;
  pdfUrl?: string;
  source?: string;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(sampleReportLeads).values({
    ...data,
    automationTrack: data.role === "clerk" || data.role === "rfo" ? "track_a" : data.role === "resident" || data.role === "press" ? "track_c" : "track_b",
  });
  return result.insertId;
}

export async function getSampleReportLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sampleReportLeads).orderBy(desc(sampleReportLeads.createdAt));
}
