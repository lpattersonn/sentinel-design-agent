CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX "design_memories_title_trgm_idx" ON "design_memories" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "design_memories_summary_trgm_idx" ON "design_memories" USING gin ("summary" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "insights_content_trgm_idx" ON "insights" USING gin ("content" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "patterns_name_trgm_idx" ON "patterns" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "patterns_description_trgm_idx" ON "patterns" USING gin ("description" gin_trgm_ops);
