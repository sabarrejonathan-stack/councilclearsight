import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Councils ─────────────────────────────────────────────────────────────────
export const councils = mysqlTable("councils", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  councilType: mysqlEnum("councilType", ["parish", "town", "community", "neighbourhood", "city", "parish_meeting"]).default("parish").notNull(),
  county: varchar("county", { length: 100 }),
  district: varchar("district", { length: 150 }),
  region: varchar("region", { length: 100 }),
  country: varchar("country", { length: 100 }).default("England"),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  populationBand: mysqlEnum("populationBand", ["under_500", "500_2000", "2000_5000", "5000_15000", "over_15000"]),
  preceptBand: mysqlEnum("preceptBand", ["under_10k", "10k_50k", "50k_150k", "150k_500k", "over_500k"]),
  meetingFrequency: varchar("meetingFrequency", { length: 100 }),
  claimStatus: mysqlEnum("claimStatus", ["unclaimed", "claimed", "verified"]).default("unclaimed").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["none", "trial", "active", "expired", "cancelled"]).default("none").notNull(),
  // Transparency indicators
  hasWebsite: boolean("hasWebsite").default(false),
  hasAgendas: boolean("hasAgendas").default(false),
  hasMinutes: boolean("hasMinutes").default(false),
  hasFinancials: boolean("hasFinancials").default(false),
  hasContactDetails: boolean("hasContactDetails").default(false),
  hasAccessibilityStatement: boolean("hasAccessibilityStatement").default(false),
  // Clerk & Chair contact (from database)
  clerkName: varchar("clerkName", { length: 255 }),
  clerkEmail: varchar("clerkEmail", { length: 320 }),
  clerkPhone: varchar("clerkPhone", { length: 50 }),
  chairName: varchar("chairName", { length: 255 }),
  chairEmail: varchar("chairEmail", { length: 320 }),
  // Councillor details (up to 3 from Excel)
  councillor1Name: varchar("councillor1Name", { length: 255 }),
  councillor1Email: varchar("councillor1Email", { length: 320 }),
  councillor2Name: varchar("councillor2Name", { length: 255 }),
  councillor2Email: varchar("councillor2Email", { length: 320 }),
  councillor3Name: varchar("councillor3Name", { length: 255 }),
  councillor3Email: varchar("councillor3Email", { length: 320 }),
  // School data (up to 3 schools with full details)
  schoolCount: int("schoolCount").default(0).notNull(),
  schoolNames: json("schoolNames"), // string[]
  schoolWebsites: json("schoolWebsites"), // string[]
  schoolEmails: json("schoolEmails"), // string[]
  schoolHeadTeachers: json("schoolHeadTeachers"), // string[]
  // School engagement evidence assessment
  schoolEngagementWebsite: boolean("schoolEngagementWebsite").default(false),
  schoolEngagementMinutes: boolean("schoolEngagementMinutes").default(false),
  schoolEngagementAccounts: boolean("schoolEngagementAccounts").default(false),
  schoolEngagementNotes: text("schoolEngagementNotes"),
  schoolEngagementSources: json("schoolEngagementSources"),
  schoolGiasUrn: json("schoolGiasUrn"),
  // Data source URLs for verification
  dataSourceWebsite: varchar("dataSourceWebsite", { length: 500 }), // Where we found the website URL
  dataSourceClerk: varchar("dataSourceClerk", { length: 500 }), // Where we found clerk info
  dataSourceTransparency: varchar("dataSourceTransparency", { length: 500 }), // Where we verified transparency
  dataSourceSchools: varchar("dataSourceSchools", { length: 500 }), // GIAS or other school source
  dataSources: json("dataSources"), // Array of { field, url, description, verifiedAt }
  dataQualityScore: int("dataQualityScore").default(0), // 0-100 based on completeness
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  // VDTI Ranking scores (Verifiable Digital Transparency Index)
  vdtiOverallScore: decimal("vdtiOverallScore", { precision: 5, scale: 2 }),
  vdtiPillar1Score: decimal("vdtiPillar1Score", { precision: 5, scale: 2 }), // Digital Presence
  vdtiPillar2Score: decimal("vdtiPillar2Score", { precision: 5, scale: 2 }), // Contact Transparency
  vdtiPillar3Score: decimal("vdtiPillar3Score", { precision: 5, scale: 2 }), // Community Connectivity
  vdtiPillar4Score: decimal("vdtiPillar4Score", { precision: 5, scale: 2 }), // Structural Completeness
  vdtiOverallRank: int("vdtiOverallRank"),
  vdtiRegionalRank: int("vdtiRegionalRank"),
  vdtiPercentile: decimal("vdtiPercentile", { precision: 5, scale: 1 }),
  vdtiMethodologyVersion: varchar("vdtiMethodologyVersion", { length: 20 }).default("1.0"),
  vdtiScoredAt: timestamp("vdtiScoredAt"),
  // V15 Governance Documents (Yes/No from V15 database)
  hasNoticeOfAudit: boolean("hasNoticeOfAudit").default(false),
  hasAssetRegister: boolean("hasAssetRegister").default(false),
  hasRegisterOfInterests: boolean("hasRegisterOfInterests").default(false),
  hasFinancialRegs: boolean("hasFinancialRegs").default(false),
  hasStandingOrders: boolean("hasStandingOrders").default(false),
  hasAnnualGovernance: boolean("hasAnnualGovernance").default(false),
  hasAnnualAccounts: boolean("hasAnnualAccounts").default(false),
  // V15 metadata
  websiteSource: varchar("websiteSource", { length: 255 }),
  emailSource: varchar("emailSource", { length: 255 }),
  gssCode: varchar("gssCode", { length: 20 }),
  dataQualityFlags: text("dataQualityFlags"),
  apiScore: int("apiScore"),
  enrichedScore: int("enrichedScore"),
  councillorsCount: int("councillorsCount").default(0),
  // Admin
  adminNotes: text("adminNotes"),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Council = typeof councils.$inferSelect;
export type InsertCouncil = typeof councils.$inferInsert;

// ─── Council Members (users linked to councils) ───────────────────────────────
export const councilMembers = mysqlTable("council_members", {
  id: int("id").autoincrement().primaryKey(),
  councilId: int("councilId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["council_admin", "council_user", "analyst"]).default("council_user").notNull(),
  invitedAt: timestamp("invitedAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
});

// ─── Invites ──────────────────────────────────────────────────────────────────
export const invites = mysqlTable("invites", {
  id: int("id").autoincrement().primaryKey(),
  councilId: int("councilId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["council_admin", "council_user", "analyst"]).default("council_user").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  councilId: int("councilId").notNull(),
  plan: mysqlEnum("plan", ["free", "gold", "platinum"]).default("free").notNull(),
  status: mysqlEnum("status", ["trial", "active", "past_due", "cancelled", "expired"]).default("trial").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  trialEndsAt: timestamp("trialEndsAt"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Survey Templates ─────────────────────────────────────────────────────────
export const surveyTemplates = mysqlTable("survey_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  isDefault: boolean("isDefault").default(false).notNull(),
  questions: json("questions").notNull(), // JSON array of question objects
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Surveys ──────────────────────────────────────────────────────────────────
export const surveys = mysqlTable("surveys", {
  id: int("id").autoincrement().primaryKey(),
  councilId: int("councilId").notNull(),
  templateId: int("templateId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "active", "closed", "archived"]).default("draft").notNull(),
  isAnonymous: boolean("isAnonymous").default(true).notNull(),
  questions: json("questions").notNull(), // JSON array of question objects
  introText: text("introText"),
  thankyouText: text("thankyouText"),
  consentText: text("consentText"),
  openDate: timestamp("openDate"),
  closeDate: timestamp("closeDate"),
  responseCount: int("responseCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = typeof surveys.$inferInsert;

// ─── Survey Responses ─────────────────────────────────────────────────────────
export const surveyResponses = mysqlTable("survey_responses", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("surveyId").notNull(),
  councilId: int("councilId").notNull(),
  answers: json("answers").notNull(), // JSON object: questionId -> answer
  respondentAge: varchar("respondentAge", { length: 20 }),
  respondentGender: varchar("respondentGender", { length: 50 }),
  respondentPostcode: varchar("respondentPostcode", { length: 10 }),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  ipHash: varchar("ipHash", { length: 64 }), // hashed for privacy
});

// ─── Benchmark Scores ─────────────────────────────────────────────────────────
export const benchmarkScores = mysqlTable("benchmark_scores", {
  id: int("id").autoincrement().primaryKey(),
  councilId: int("councilId").notNull(),
  surveyId: int("surveyId"),
  period: varchar("period", { length: 20 }).notNull(), // e.g. "2024-Q1"
  overallScore: decimal("overallScore", { precision: 5, scale: 2 }),
  governanceScore: decimal("governanceScore", { precision: 5, scale: 2 }),
  residentVoiceScore: decimal("residentVoiceScore", { precision: 5, scale: 2 }),
  communityEngagementScore: decimal("communityEngagementScore", { precision: 5, scale: 2 }),
  deliveryScore: decimal("deliveryScore", { precision: 5, scale: 2 }),
  percentileOverall: decimal("percentileOverall", { precision: 5, scale: 2 }),
  percentileGovernance: decimal("percentileGovernance", { precision: 5, scale: 2 }),
  percentileResidentVoice: decimal("percentileResidentVoice", { precision: 5, scale: 2 }),
  percentileCommunityEngagement: decimal("percentileCommunityEngagement", { precision: 5, scale: 2 }),
  percentileDelivery: decimal("percentileDelivery", { precision: 5, scale: 2 }),
  peerGroupSize: int("peerGroupSize"),
  responseCount: int("responseCount"),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

export type BenchmarkScore = typeof benchmarkScores.$inferSelect;

// ─── Recommendations ──────────────────────────────────────────────────────────
export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  councilId: int("councilId").notNull(),
  benchmarkScoreId: int("benchmarkScoreId"),
  pillar: mysqlEnum("pillar", ["governance", "resident_voice", "community_engagement", "delivery"]).notNull(),
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["pending_review", "approved", "rejected", "actioned"]).default("pending_review").notNull(),
  isAiGenerated: boolean("isAiGenerated").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recommendation = typeof recommendations.$inferSelect;

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  councilId: int("councilId").notNull(),
  benchmarkScoreId: int("benchmarkScoreId"),
  type: mysqlEnum("type", ["executive_summary", "full_survey", "annual_benchmark", "peer_comparison", "resident_facing", "improvement"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  period: varchar("period", { length: 20 }),
  fileUrl: varchar("fileUrl", { length: 1000 }),
  status: mysqlEnum("status", ["generating", "ready", "failed"]).default("generating").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  body: text("body").notNull(),
  category: varchar("category", { length: 100 }),
  tags: json("tags"), // string[]
  authorName: varchar("authorName", { length: 255 }),
  coverImageUrl: varchar("coverImageUrl", { length: 1000 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  readingTimeMinutes: int("readingTimeMinutes"),
  isAutomated: boolean("isAutomated").default(false).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  sourceName: varchar("sourceName", { length: 255 }),
  ctaText: varchar("ctaText", { length: 500 }),
  metaDescription: varchar("metaDescription", { length: 320 }),
  metaKeywords: varchar("metaKeywords", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;

// ─── Admin Audit Log ──────────────────────────────────────────────────────────
export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Interest Registrations ─────────────────────────────────────────────────
export const interestRegistrations = mysqlTable("interest_registrations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  councilName: varchar("councilName", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  status: mysqlEnum("status", ["new", "contacted", "converted"]).default("new").notNull(),
  source: varchar("source", { length: 100 }).default("website"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InterestRegistration = typeof interestRegistrations.$inferSelect;

// ─── Newsletter Subscribers ───────────────────────────────────────────────────
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  councilName: varchar("councilName", { length: 255 }),
  status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
  source: varchar("source", { length: 100 }).default("website"),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

// ─── Score Challenges ─────────────────────────────────────────────────────────
export const scoreChallenges = mysqlTable("score_challenges", {
  id: int("id").autoincrement().primaryKey(),
  councilId: int("councilId").notNull(),
  councilName: varchar("councilName", { length: 255 }).notNull(),
  submitterName: varchar("submitterName", { length: 255 }).notNull(),
  submitterEmail: varchar("submitterEmail", { length: 320 }).notNull(),
  submitterRole: varchar("submitterRole", { length: 100 }),
  challengedPillar: varchar("challengedPillar", { length: 100 }),
  reason: text("reason").notNull(),
  evidenceUrl: varchar("evidenceUrl", { length: 1000 }),
  status: mysqlEnum("status", ["pending", "under_review", "accepted", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScoreChallenge = typeof scoreChallenges.$inferSelect;

// ─── Demo Requests ────────────────────────────────────────────────────────────
export const demoRequests = mysqlTable("demo_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  councilName: varchar("councilName", { length: 255 }),
  role: varchar("role", { length: 100 }),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "completed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Snapshot Requests (Free Tier Lead Capture) ───────────────────────────────
export const snapshotRequests = mysqlTable("snapshot_requests", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  councilId: int("councilId"),
  councilName: varchar("councilName", { length: 255 }).notNull(),
  councilSlug: varchar("councilSlug", { length: 255 }),
  vdtiScore: int("vdtiScore"),
  pillar1Score: int("pillar1Score"),
  pillar2Score: int("pillar2Score"),
  pillar3Score: int("pillar3Score"),
  pillar4Score: int("pillar4Score"),
  nationalRank: int("nationalRank"),
  totalCouncils: int("totalCouncils"),
  pdfUrl: text("pdfUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SnapshotRequest = typeof snapshotRequests.$inferSelect;

// ─── Sample Report Leads (Gated Form) ────────────────────────────────────────
export const sampleReportLeads = mysqlTable("sample_report_leads", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  councilId: int("councilId").notNull(),
  councilSlug: varchar("councilSlug", { length: 255 }).notNull(),
  councilName: varchar("councilName", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["clerk", "rfo", "chair", "councillor", "officer", "resident", "press", "other"]).notNull(),
  phone: varchar("phone", { length: 50 }),
  marketingConsent: boolean("marketingConsent").default(false).notNull(),
  pdfUrl: text("pdfUrl"),
  emailSentAt: timestamp("emailSentAt"),
  automationTrack: mysqlEnum("automationTrack", ["track_a", "track_b", "track_c"]).default("track_a"),
  source: varchar("source", { length: 100 }).default("sample_report_gate"),
  ipAddress: varchar("ipAddress", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SampleReportLead = typeof sampleReportLeads.$inferSelect;

// ─── Capacity Counter ────────────────────────────────────────────────────────
export const capacityCounter = mysqlTable("capacity_counter", {
  id: int("id").autoincrement().primaryKey(),
  quarter: varchar("quarter", { length: 10 }).notNull(), // e.g. "Q2_2026"
  totalSlots: int("totalSlots").default(200).notNull(),
  usedSlots: int("usedSlots").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
