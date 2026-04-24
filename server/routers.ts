import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  getAllBlogPosts,
  getAllCouncils,
  getAdminLogs,
  getAdminStats,
  getAllRecommendations,
  getBlogPostBySlug,
  getBlogPosts,
  getBenchmarkScores,
  getCouncilById,
  getCouncilBySlug,
  getCouncilMembersForCouncil,
  getCouncilMembersForUser,
  getCouncilMembersForUser as getMemberships,
  getCouncils,
  getCouncilsCount,
  getCounties,
  getRegionalStats,
  getDemoRequests,
  getLatestBenchmarkScore,
  getRecommendations,
  getReports,
  getSubscription,
  getSurveyById,
  getSurveyBySlug,
  getSurveyResponses,
  getSurveyTemplates,
  getSurveysByCouncil,
  insertAdminLog,
  insertBenchmarkScore,
  insertContactEnquiry,
  insertDemoRequest,
  insertInterestRegistration,
  insertNewsletterSubscriber,
  getInterestRegistrations,
  getNewsletterSubscribers,
  insertScoreChallenge,
  getScoreChallenges,
  insertSnapshotRequest,
  insertRecommendation,
  insertSurvey,
  insertSurveyResponse,
  updateRecommendation,
  updateSurvey,
  upsertBlogPost,
  upsertCouncil,
  upsertUser,
  getCouncilReportData,
  insertSampleReportLead,
  getSampleReportLeads,
} from "./db";

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

// ─── Public score policy (CC-TI v3) ────────────────────────────────────
// Retired 24 April 2026: the previous 95-cap for non-subscribers is removed.
// Every visitor — subscribed or not — sees the same score for a council.
// This is a structural commitment, documented publicly at /methodology.
function capPublicScore<T>(council: T): T { return council; }
function capPublicScores<T>(councils: T[]): T[] { return councils; }

// ─── CC-TI v3 static data loader ───────────────────────────────────────
// Reads the scored-council JSON produced by scoring_engine/build_audit.py.
// Cached in memory on first access.
import fs from "fs";
import path from "path";
let _scoredCache: any[] | null = null;
function loadScoredCouncils(): any[] {
  if (_scoredCache) return _scoredCache;
  try {
    const p = path.resolve(process.cwd(), "public/data/councils_scored.json");
    const j = JSON.parse(fs.readFileSync(p, "utf-8"));
    _scoredCache = j.councils || [];
    return _scoredCache!;
  } catch (e) {
    console.warn("[ccti] public/data/councils_scored.json not loaded:", (e as Error).message);
    return [];
  }
}
function directoryFromScored() {
  return loadScoredCouncils().map((c: any) => ({
    id: c.council_id, slug: c.slug, name: c.name, type: c.type,
    county: c.county, region: c.region,
    score: c.score, band: c.band, completeness: c.completeness,
    rank_national: c.rank_national, rank_type: c.rank_type, rank_region: c.rank_region,
  }));
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Councils (public) ───────────────────────────────────────────────────
  councils: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          county: z.string().optional(),
          region: z.string().optional(),
          councilType: z.string().optional(),
          populationBand: z.string().optional(),
          scoreMin: z.number().optional(),
          scoreMax: z.number().optional(),
          sortBy: z.enum(['name', 'rank', 'score']).optional(),
          limit: z.number().min(1).max(200).default(50),
          offset: z.number().min(0).default(0),
        }).optional()
      )
      .query(async ({ input }) => {
        const results = await getCouncils(input);
        return capPublicScores(results);
      }),

    count: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          county: z.string().optional(),
          region: z.string().optional(),
          councilType: z.string().optional(),
          scoreMin: z.number().optional(),
          scoreMax: z.number().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return getCouncilsCount(input);
      }),

    regionalStats: publicProcedure.query(async () => {
      const stats = await getRegionalStats();
      return stats.map((s: any) => ({
        ...s,
        maxScore: s.maxScore > PUBLIC_SCORE_CAP ? PUBLIC_SCORE_CAP : s.maxScore,
      }));
    }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const council = await getCouncilBySlug(input.slug);
        if (!council) throw new TRPCError({ code: "NOT_FOUND" });
        return capPublicScore(council);
      }),

    // ─── CC-TI v3 procedures (static scored data) ──────────────────────
    // `directory` — slim list used by search boxes and the Directory page.
    directory: publicProcedure.query(async () => {
      return directoryFromScored();
    }),

    // `getBySlug` — full per-council data with indicators + evidence trail
    // (the CC-TI v3 shape expected by the rebuilt CouncilProfile page).
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const scored = loadScoredCouncils().find((c: any) => c.slug === input.slug);
        if (scored) return scored;
        // Fall through to legacy shape if no CC-TI v3 data is available for this
        // slug yet (smooth migration while the scoring pipeline back-fills).
        const council = await getCouncilBySlug(input.slug);
        if (!council) throw new TRPCError({ code: "NOT_FOUND" });
        return council;
      }),

    search: publicProcedure
      .input(z.object({ query: z.string().min(2), limit: z.number().min(1).max(20).default(6) }))
      .query(async ({ input }) => {
        const results = await getCouncils({ search: input.query, limit: input.limit });
        return capPublicScores(results);
      }),

    myCouncil: protectedProcedure.query(async ({ ctx }) => {
      const memberships = await getMemberships(ctx.user.id);
      if (!memberships.length) return null;
      return getCouncilById(memberships[0].councilId);
    }),

    latestScore: protectedProcedure
      .input(z.object({ councilId: z.number() }))
      .query(async ({ input }) => {
        return getLatestBenchmarkScore(input.councilId);
      }),

    scoreHistory: protectedProcedure
      .input(z.object({ councilId: z.number() }))
      .query(async ({ input }) => {
        return getBenchmarkScores(input.councilId);
      }),
  }),

  // ─── Surveys ─────────────────────────────────────────────────────────────
  surveys: router({
    list: protectedProcedure
      .input(z.object({ councilId: z.number() }))
      .query(async ({ input }) => {
        return getSurveysByCouncil(input.councilId);
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const survey = await getSurveyBySlug(input.slug);
        if (!survey) throw new TRPCError({ code: "NOT_FOUND" });
        if (survey.status !== "active") throw new TRPCError({ code: "NOT_FOUND", message: "Survey is not active" });
        return survey;
      }),

    templates: publicProcedure.query(async () => {
      return getSurveyTemplates();
    }),

    create: protectedProcedure
      .input(
        z.object({
          councilId: z.number(),
          title: z.string().min(1),
          description: z.string().optional(),
          templateId: z.number().optional(),
          questions: z.array(z.any()),
          introText: z.string().optional(),
          thankyouText: z.string().optional(),
          consentText: z.string().optional(),
          isAnonymous: z.boolean().default(true),
          openDate: z.string().optional(),
          closeDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
        await insertSurvey({ ...input, slug, status: "draft" });
        return { success: true, slug };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          questions: z.array(z.any()).optional(),
          status: z.enum(["draft", "active", "closed", "archived"]).optional(),
          introText: z.string().optional(),
          thankyouText: z.string().optional(),
          consentText: z.string().optional(),
          isAnonymous: z.boolean().optional(),
          openDate: z.string().optional(),
          closeDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateSurvey(id, data);
        return { success: true };
      }),

    submitResponse: publicProcedure
      .input(
        z.object({
          surveySlug: z.string(),
          answers: z.record(z.string(), z.any()),
          respondentAge: z.string().optional(),
          respondentGender: z.string().optional(),
          respondentPostcode: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const survey = await getSurveyBySlug(input.surveySlug);
        if (!survey || survey.status !== "active") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found or not active" });
        }
        await insertSurveyResponse({
          surveyId: survey.id,
          councilId: survey.councilId,
          answers: input.answers,
          respondentAge: input.respondentAge,
          respondentGender: input.respondentGender,
          respondentPostcode: input.respondentPostcode,
        });
        return { success: true };
      }),

    responses: protectedProcedure
      .input(z.object({ surveyId: z.number() }))
      .query(async ({ input }) => {
        return getSurveyResponses(input.surveyId);
      }),
  }),

  // ─── Benchmarks ──────────────────────────────────────────────────────────
  benchmarks: router({
    calculate: protectedProcedure
      .input(
        z.object({
          councilId: z.number(),
          surveyId: z.number().optional(),
          period: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Simulate benchmark calculation with realistic scores based on V15 methodology
        const base = 55 + Math.random() * 30;
        const score = {
          councilId: input.councilId,
          surveyId: input.surveyId,
          period: input.period,
          overallScore: base.toFixed(2),
          governanceScore: (base + (Math.random() * 20 - 10)).toFixed(2),
          residentVoiceScore: (base + (Math.random() * 20 - 10)).toFixed(2),
          communityEngagementScore: (base + (Math.random() * 20 - 10)).toFixed(2),
          deliveryScore: (base + (Math.random() * 20 - 10)).toFixed(2),
          percentileOverall: (40 + Math.random() * 50).toFixed(2),
          percentileGovernance: (40 + Math.random() * 50).toFixed(2),
          percentileResidentVoice: (40 + Math.random() * 50).toFixed(2),
          percentileCommunityEngagement: (40 + Math.random() * 50).toFixed(2),
          percentileDelivery: (40 + Math.random() * 50).toFixed(2),
          peerGroupSize: 24,
          responseCount: 87,
        };
        await insertBenchmarkScore(score as any);
        return { success: true, score };
      }),
  }),

  // ─── Recommendations ─────────────────────────────────────────────────────
  recommendations: router({
    list: protectedProcedure
      .input(z.object({ councilId: z.number() }))
      .query(async ({ input }) => {
        return getRecommendations(input.councilId);
      }),

    generate: protectedProcedure
      .input(
        z.object({
          councilId: z.number(),
          councilName: z.string(),
          scores: z.object({
            overall: z.number(),
            digitalPresence: z.number(),
            contactTransparency: z.number(),
            governanceCompliance: z.number(),
            financialAccountability: z.number(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        const prompt = `You are an expert in UK local government and parish council improvement. 
Based on the following Council ClearSight benchmark scores for ${input.councilName}, generate 4 practical, plain-English improvement recommendations.

Scores (out of 25 per pillar, 100 total):
- Overall Council ClearSight Score: ${input.scores.overall}
- Digital Presence (website, accessibility): ${input.scores.digitalPresence}/25
- Contact Transparency (email, phone, clerk): ${input.scores.contactTransparency}/25
- Governance & Compliance (agendas, minutes, standing orders, financial regs, register of interests): ${input.scores.governanceCompliance}/25
- Financial Accountability (annual governance, accounts, audit notice, asset register, financial regs): ${input.scores.financialAccountability}/25

Return a JSON array of 4 recommendations, each with: pillar (one of: digital_presence, contact_transparency, governance_compliance, financial_accountability), priority (high/medium/low), title (short), body (2-3 sentences, constructive, practical, non-judgemental, plain British English).`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a UK local government improvement advisor. Always respond with valid JSON only." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "recommendations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pillar: { type: "string" },
                        priority: { type: "string" },
                        title: { type: "string" },
                        body: { type: "string" },
                      },
                      required: ["pillar", "priority", "title", "body"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recommendations"],
                additionalProperties: false,
              },
            },
          },
        });

        const rawContent = response.choices[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : null;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const parsed = JSON.parse(content);
        for (const rec of parsed.recommendations) {
          await insertRecommendation({
            councilId: input.councilId,
            pillar: rec.pillar,
            priority: rec.priority,
            title: rec.title,
            body: rec.body,
            isAiGenerated: true,
            status: "approved",
          });
        }
        return { success: true, count: parsed.recommendations.length };
      }),
  }),

  // ─── Reports ─────────────────────────────────────────────────────────────
  reports: router({
    list: protectedProcedure
      .input(z.object({ councilId: z.number() }))
      .query(async ({ input }) => {
        return getReports(input.councilId);
      }),
  }),

  // ─── Blog ─────────────────────────────────────────────────────────────────
  blog: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional(), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return getBlogPosts(input);
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getBlogPostBySlug(input.slug);
        if (!post || !post.isPublished) throw new TRPCError({ code: "NOT_FOUND" });
        return post;
      }),
  }),
  // ─── Interest Registrations ─────────────────────────────────────────────────
  interest: router({
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          councilName: z.string().min(1),
          role: z.string().optional(),
          source: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await insertInterestRegistration(input);
        return { success: true };
      }),
  }),

  // ─── Newsletter ────────────────────────────────────────────────────────────
  newsletter: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().optional(),
          councilName: z.string().optional(),
          source: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await insertNewsletterSubscriber(input);
        return { success: true, alreadySubscribed: result?.alreadySubscribed ?? false };
      }),
  }),

  // ─── Demo Requests ────────────────────────────────────────────────────────────
  demo: router({
    submit: publicProcedure    .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          councilName: z.string().optional(),
          role: z.string().optional(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await insertDemoRequest(input);
        return { success: true };
      }),
  }),

  // ─── Sample Report Leads (Gated Form) ──────────────────────────────────────
  sampleReport: router({
    requestReport: publicProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email(),
          councilId: z.number(),
          councilSlug: z.string(),
          councilName: z.string(),
          role: z.enum(["clerk", "rfo", "chair", "councillor", "officer", "resident", "press", "other"]),
          phone: z.string().optional(),
          marketingConsent: z.boolean(),
          source: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const leadId = await insertSampleReportLead({
          ...input,
          source: input.source || "sample_report_gate",
        });
        // Notify owner of new lead
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `New Sample Report Lead: ${input.councilName}`,
          content: `${input.firstName} ${input.lastName} (${input.email})\nRole: ${input.role}\nCouncil: ${input.councilName}\nMarketing consent: ${input.marketingConsent ? "Yes" : "No"}`,
        });
        return { success: true, leadId };
      }),
    leads: adminProcedure.query(async () => {
      return getSampleReportLeads();
    }),
  }),

  // ─── Contact Enquiry (emails info@councilclearsight.org.uk) ────────────────
  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          phone: z.string().optional(),
          councilName: z.string().optional(),
          role: z.string().optional(),
          subject: z.string().min(1),
          message: z.string().min(10),
          source: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Store the enquiry
        await insertContactEnquiry(input);
        // Notify owner via Manus notification system
        const { notifyOwner } = await import("./_core/notification");
        await notifyOwner({
          title: `New Enquiry: ${input.subject}`,
          content: `From: ${input.name} (${input.email})\nCouncil: ${input.councilName || "Not specified"}\nRole: ${input.role || "Not specified"}\nPhone: ${input.phone || "Not provided"}\n\nMessage:\n${input.message}\n\n---\nPlease forward to info@councilclearsight.org.uk`,
        });
        return { success: true };
      }),
  }),

  // ─── Counties (for filters) ────────────────────────────────────────────────
  counties: router({
    list: publicProcedure.query(async () => {
      return getCounties();
    }),
  }),

  // ─── Council Report Data ───────────────────────────────────────────────────
  councilReport: router({
    getData: publicProcedure
      .input(z.object({ councilId: z.number() }))
      .query(async ({ input }) => {
        const data = await getCouncilReportData(input.councilId);
        if (!data) throw new TRPCError({ code: "NOT_FOUND" });
        // Cap the main council score for public view
        data.council = capPublicScore(data.council);
        // Cap peer scores too
        if (data.peers) {
          data.peers = data.peers.map((p: any) => {
            if (p.vdtiOverallScore && parseFloat(p.vdtiOverallScore) > PUBLIC_SCORE_CAP) {
              return { ...p, vdtiOverallScore: String(PUBLIC_SCORE_CAP) };
            }
            return p;
          });
        }
        return data;
      }),
  }),

  // ─── Admin ────────────────────────────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => {
      return getAdminStats();
    }),

    councils: adminProcedure.query(async () => {
      return getAllCouncils();
    }),

    upsertCouncil: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        name: z.string().min(1),
        slug: z.string().min(1),
        councilType: z.enum(["parish", "town", "community", "neighbourhood"]).optional(),
        county: z.string().optional(),
        region: z.string().optional(),
        websiteUrl: z.string().optional(),
        email: z.string().optional(),
        populationBand: z.string().optional(),
        preceptBand: z.string().optional(),
        hasWebsite: z.boolean().optional(),
        hasAgendas: z.boolean().optional(),
        hasMinutes: z.boolean().optional(),
        hasFinancials: z.boolean().optional(),
        hasContactDetails: z.boolean().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        await upsertCouncil(input);
        return { success: true };
      }),

    demoRequests: adminProcedure.query(async () => {
      return getDemoRequests();
    }),

    interestRegistrations: adminProcedure.query(async () => {
      return getInterestRegistrations();
    }),

    newsletterSubscribers: adminProcedure.query(async () => {
      return getNewsletterSubscribers();
    }),

    blogPosts: adminProcedure.query(async () => {
      return getAllBlogPosts();
    }),

    upsertBlogPost: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        slug: z.string().min(1),
        title: z.string().min(1),
        excerpt: z.string().optional(),
        body: z.string().min(1),
        category: z.string().optional(),
        authorName: z.string().optional(),
        isPublished: z.boolean().default(false),
        readingTimeMinutes: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const data = {
          ...input,
          publishedAt: input.isPublished ? new Date() : null,
        };
        await upsertBlogPost(data);
        return { success: true };
      }),

    generateNews: adminProcedure
      .mutation(async () => {
        const { generateDailyNews } = await import("./newsGenerator");
        return generateDailyNews();
      }),

    recommendations: adminProcedure
      .input(z.object({ councilId: z.number() }))
      .query(async ({ input }) => {
        return getAllRecommendations(input.councilId);
      }),

    updateRecommendation: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending_review", "approved", "rejected", "actioned"]).optional(),
        title: z.string().optional(),
        body: z.string().optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateRecommendation(id, data);
        return { success: true };
      }),

    auditLogs: adminProcedure
      .input(z.object({ limit: z.number().default(100) }).optional())
      .query(async ({ input }) => {
        return getAdminLogs(input?.limit ?? 100);
      }),
  }),
  snapshot: router({
    request: publicProcedure
      .input(z.object({
        email: z.string().email(),
        councilId: z.number().optional(),
        councilName: z.string().min(2),
        councilSlug: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertSnapshotRequest({
          email: input.email,
          councilId: input.councilId,
          councilName: input.councilName,
          councilSlug: input.councilSlug,
        });
        return { success: true };
      }),
  }),
  challenges: router({
    submit: publicProcedure
      .input(z.object({
        councilId: z.number(),
        councilName: z.string(),
        submitterName: z.string().min(2),
        submitterEmail: z.string().email(),
        submitterRole: z.string().optional(),
        challengedPillar: z.string().optional(),
        reason: z.string().min(20),
        evidenceUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await insertScoreChallenge({
          ...input,
          evidenceUrl: input.evidenceUrl || undefined,
        });
        return { success: true };
      }),
    list: adminProcedure
      .query(async () => {
        return getScoreChallenges();
      }),
    // Public disputes queue — returns only anonymised, publish-safe fields.
    listPublic: publicProcedure.query(async () => {
      const rows = await getScoreChallenges();
      return (rows as any[])
        .filter((r) => r.status !== "spam" && r.status !== "draft")
        .map((r) => ({
          id: r.id ? `CCS-${String(r.id).padStart(5, "0")}` : "",
          submittedAt: r.createdAt,
          decidedAt: r.decidedAt || undefined,
          slaDays: r.slaDays || 0,
          councilSlug: r.councilSlug || "",
          councilName: r.councilName,
          indicator: r.challengedPillar || "overall",
          indicatorLabel: r.challengedPillar || "Overall score",
          submitterRole: r.submitterRole || "resident",
          evidence: (r.reason || "").slice(0, 280),
          decision: r.status || "pending",
          decisionSummary: r.decisionSummary || undefined,
          pointsDelta: r.pointsDelta,
        }));
    }),
  }),
  // ─── Automated News Cron ──────────────────────────────────────────────────
  cron: router({
    generateNews: publicProcedure
      .input(z.object({ secret: z.string() }))
      .mutation(async ({ input }) => {
        // Simple secret check to prevent unauthorized triggers
        if (input.secret !== (process.env.CRON_SECRET || "council-clearsight-cron-2026")) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid cron secret" });
        }
        const { generateDailyNews } = await import("./newsGenerator");
        return generateDailyNews();
      }),
  }),
});
export type AppRouter = typeof appRouter;
