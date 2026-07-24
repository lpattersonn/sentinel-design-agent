import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

export const EMBEDDING_DIM = 1536;

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    industry: text("industry"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("projects_name_lower_idx").on(sql`lower(${t.name})`)],
);

export const designMemories = pgTable(
  "design_memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    sourceType: text("source_type").notNull(), // url | html | screenshot | figma | description
    sourceRef: text("source_ref"), // original URL / file name when applicable
    industry: text("industry"),
    brand: text("brand"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    analysis: jsonb("analysis").notNull(), // DesignAnalysis
    summary: text("summary").notNull(),
    traits: jsonb("traits").$type<string[]>().notNull().default([]),
    qualityScore: integer("quality_score"), // 0-100, adjusted by the learning engine
    // Client-work memories: identity (title/brand/sourceRef) is redacted on every
    // agent-facing read path; only the dashboard sees full attribution.
    confidential: boolean("confidential").notNull().default(false),
    embedding: vector("embedding", { dimensions: EMBEDDING_DIM }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("design_memories_industry_idx").on(t.industry),
    index("design_memories_embedding_idx").using(
      "hnsw",
      t.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export const patterns = pgTable(
  "patterns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(), // hero | pricing | cta | testimonials | navigation | cards | forms | dashboard | feature-grid | faq | footer | other
    description: text("description").notNull(),
    whyItWorks: text("why_it_works").notNull(),
    strengths: jsonb("strengths").$type<string[]>().notNull().default([]),
    weaknesses: jsonb("weaknesses").$type<string[]>().notNull().default([]),
    idealUseCases: jsonb("ideal_use_cases").$type<string[]>().notNull().default([]),
    industries: jsonb("industries").$type<string[]>().notNull().default([]),
    complexity: integer("complexity").notNull().default(2), // 1-5
    conversionScore: integer("conversion_score").notNull().default(50), // 0-100, adjusted by learning
    spec: jsonb("spec"), // structured layout spec: spacing, grid, typography hints
    source: text("source"), // where the pattern was learned from
    embedding: vector("embedding", { dimensions: EMBEDDING_DIM }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("patterns_slug_idx").on(t.slug),
    index("patterns_category_idx").on(t.category),
    index("patterns_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

export const designScores = pgTable("design_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id),
  target: text("target").notNull(), // short description of what was scored
  scores: jsonb("scores").notNull(), // ScoreBreakdown (11 dimensions + reasoning)
  overall: integer("overall").notNull(), // 0-100
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const feedbackEvents = pgTable("feedback_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id),
  projectName: text("project_name"),
  outcome: text("outcome").notNull(), // accepted | revision_requested | converted | rejected
  details: jsonb("details"), // LearnInput payload
  learned: boolean("learned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insights = pgTable(
  "insights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(), // layout | typography | color | conversion | industry | process | other
    content: text("content").notNull(),
    evidence: jsonb("evidence"), // references to feedback events / memories / patterns
    confidence: real("confidence").notNull().default(0.5), // 0-1
    embedding: vector("embedding", { dimensions: EMBEDDING_DIM }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("insights_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

// Fixed-window rate limiting: one row per (key fingerprint, hour window).
export const rateWindows = pgTable("rate_windows", {
  bucket: text("bucket").primaryKey(), // "<key-fingerprint>:<epoch-hour>"
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProjectRow = typeof projects.$inferSelect;
export type DesignMemoryRow = typeof designMemories.$inferSelect;
export type NewDesignMemory = typeof designMemories.$inferInsert;
export type PatternRow = typeof patterns.$inferSelect;
export type NewPattern = typeof patterns.$inferInsert;
export type DesignScoreRow = typeof designScores.$inferSelect;
export type FeedbackEventRow = typeof feedbackEvents.$inferSelect;
export type InsightRow = typeof insights.$inferSelect;
