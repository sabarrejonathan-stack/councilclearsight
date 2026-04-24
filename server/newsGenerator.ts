/**
 * Automated News Article Generator for Council ClearSight
 * 
 * Generates 2 daily articles from authoritative parish council sources,
 * optimised for SEO and driving subscriptions.
 */
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { upsertBlogPost } from "./db";

const AUTHORITATIVE_SOURCES = [
  { name: "NALC", topics: ["parish council policy", "local council funding", "community governance"] },
  { name: "SLCC", topics: ["clerk professional development", "council administration", "meeting procedures"] },
  { name: "LGA", topics: ["local government reform", "council funding", "devolution"] },
  { name: "MHCLG", topics: ["government policy", "local government legislation", "transparency code"] },
  { name: "GOV.UK", topics: ["local government finance", "council tax", "precept regulations"] },
  { name: "CPRE", topics: ["rural communities", "planning policy", "neighbourhood plans"] },
  { name: "Electoral Commission", topics: ["local elections", "parish council elections", "voter engagement"] },
];

const ARTICLE_CATEGORIES = [
  "Transparency & Accountability",
  "Funding & Finance",
  "Community Engagement",
  "Governance & Compliance",
  "Digital & Innovation",
  "Elections & Democracy",
  "Planning & Development",
  "Best Practice",
];

const CTA_VARIANTS = [
  "See how your council compares \u2014 check your VDTI score on Council ClearSight.",
  "Is your council meeting transparency standards? Find out on Council ClearSight.",
  "Council ClearSight ranks over 10,000 parish councils on transparency. Where does yours stand?",
  "Subscribe to Council ClearSight for data-driven recommendations tailored to your council.",
  "Join hundreds of councils already using Council ClearSight to improve accountability.",
  "Get your council's full transparency report \u2014 subscribe to Council ClearSight today.",
  "Discover your council's strengths and areas for improvement with Council ClearSight's VDTI framework.",
  "Don't wait for residents to ask questions \u2014 lead with transparency. Start on Council ClearSight today.",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 200);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateNewsArticle(articleIndex: number = 0): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const source = AUTHORITATIVE_SOURCES[articleIndex % AUTHORITATIVE_SOURCES.length];
    const topic = pickRandom(source.topics);
    const category = pickRandom(ARTICLE_CATEGORIES);
    const cta = pickRandom(CTA_VARIANTS);

    const today = new Date();
    const dateStr = today.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a senior editorial writer for Council ClearSight, a platform that ranks over 10,000 parish and town councils in England on transparency and accountability using the VDTI (Verifiable Digital Transparency Index) framework.

Your audience is parish council clerks, councillors, and engaged residents. Write in a professional but accessible tone \u2014 authoritative without being academic, practical without being patronising.

You must write articles that:
1. Are based on real, current issues facing parish councils in England
2. Reference authoritative bodies (${source.name}, NALC, SLCC, LGA, MHCLG, GOV.UK) naturally
3. Include specific, verifiable facts and figures where possible
4. Are SEO-optimised with natural keyword usage
5. Drive engagement without being overtly salesy
6. Subtly position Council ClearSight as a valuable resource

NEVER fabricate quotes from named individuals. You may reference published guidance, reports, or statistics from authoritative bodies.`
        },
        {
          role: "user",
          content: `Write a news article for Council ClearSight's website. Today is ${dateStr}.

Topic area: ${topic}
Category: ${category}
Source authority: ${source.name}

Requirements:
- Headline: Compelling, specific, 8-14 words, optimised for clicks from parish council clerks and councillors
- Excerpt: 1-2 sentences, 150-200 characters, compelling summary
- Body: 600-900 words in markdown format. Include subheadings (##), practical takeaways, and reference to authoritative guidance
- Meta description: 150-160 characters for SEO
- Meta keywords: 6-8 comma-separated keywords relevant to parish councils
- Reading time: estimated minutes

The article should naturally conclude with a brief mention of how Council ClearSight can help councils assess and improve their transparency, without being a hard sell.

Return as JSON with these exact fields:
{
  "title": "...",
  "excerpt": "...",
  "body": "... (markdown)",
  "metaDescription": "...",
  "metaKeywords": "...",
  "readingTimeMinutes": 4,
  "imagePrompt": "A brief description for generating a relevant, professional header image (no text in image)"
}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "news_article",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Article headline" },
              excerpt: { type: "string", description: "Short summary" },
              body: { type: "string", description: "Full article body in markdown" },
              metaDescription: { type: "string", description: "SEO meta description" },
              metaKeywords: { type: "string", description: "Comma-separated keywords" },
              readingTimeMinutes: { type: "integer", description: "Estimated reading time" },
              imagePrompt: { type: "string", description: "Image generation prompt" },
            },
            required: ["title", "excerpt", "body", "metaDescription", "metaKeywords", "readingTimeMinutes", "imagePrompt"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error("No content returned from LLM");
    const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);

    const article = JSON.parse(content);
    const slug = slugify(article.title) + "-" + Date.now().toString(36);

    // Generate cover image
    let coverImageUrl = "";
    try {
      const imageResult = await generateImage({
        prompt: `Professional, high-quality editorial photograph for a news article about English parish councils. ${article.imagePrompt}. Style: clean, modern editorial photography with warm natural lighting. No text overlays.`,
      });
      coverImageUrl = imageResult.url || "";
    } catch (imgErr) {
      console.warn("[NewsGenerator] Image generation failed, continuing without image:", imgErr);
    }

    // Save to database
    await upsertBlogPost({
      slug,
      title: article.title,
      excerpt: article.excerpt,
      body: article.body,
      category,
      tags: JSON.stringify([topic, source.name, "parish council", "transparency"]),
      authorName: "Council ClearSight Editorial",
      coverImageUrl,
      isPublished: true,
      publishedAt: new Date(),
      readingTimeMinutes: article.readingTimeMinutes || 4,
      isAutomated: true,
      sourceUrl: "",
      sourceName: source.name,
      ctaText: cta,
      metaDescription: article.metaDescription,
      metaKeywords: article.metaKeywords,
    });

    console.log(`[NewsGenerator] Published: "${article.title}" (${slug})`);
    return { success: true, slug };
  } catch (error: any) {
    console.error("[NewsGenerator] Failed to generate article:", error);
    return { success: false, error: error.message };
  }
}

export async function generateDailyNews(): Promise<{ results: Array<{ success: boolean; slug?: string; error?: string }> }> {
  console.log("[NewsGenerator] Starting daily news generation...");
  const results = [];
  
  for (let i = 0; i < 2; i++) {
    const result = await generateNewsArticle(i + Math.floor(Math.random() * AUTHORITATIVE_SOURCES.length));
    results.push(result);
    // Small delay between articles
    if (i < 1) await new Promise(r => setTimeout(r, 2000));
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`[NewsGenerator] Daily generation complete: ${successCount}/2 articles published`);
  return { results };
}
