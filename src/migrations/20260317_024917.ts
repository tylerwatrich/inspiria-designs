import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_quality_audit_flag" AS ENUM('clean', 'needs-attention', 'ai-slop', 'incoherent', 'both');
  CREATE TYPE "public"."enum__posts_v_version_quality_audit_flag" AS ENUM('clean', 'needs-attention', 'ai-slop', 'incoherent', 'both');
  CREATE TYPE "public"."enum_page_views_device_type" AS ENUM('desktop', 'mobile', 'tablet');
  CREATE TYPE "public"."enum_article_suggestions_vertical" AS ENUM('nuclear', 'ai-cloud', 'construction-tech', 'finance', 'trade', 'deep-tech');
  CREATE TYPE "public"."enum_article_suggestions_status" AS ENUM('pending', 'approved', 'denied', 'published', 'stale');
  CREATE TYPE "public"."enum_automation_settings_research_provider" AS ENUM('claude', 'gemini');
  CREATE TABLE "posts_quality_audit_issues" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"issue" varchar
  );
  
  CREATE TABLE "posts_article_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"update_number" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"summary" varchar,
  	"update_text" varchar
  );
  
  CREATE TABLE "_posts_v_version_quality_audit_issues" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"issue" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_version_article_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"update_number" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"summary" varchar,
  	"update_text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "search_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"industry" varchar NOT NULL,
  	"province" varchar,
  	"hide_u_s" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "page_views_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"path" varchar,
  	"title" varchar,
  	"visited_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "page_views" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"visitor_id" varchar NOT NULL,
  	"fingerprint_id" varchar,
  	"device_type" "enum_page_views_device_type",
  	"browser" varchar,
  	"os" varchar,
  	"ip_address" varchar,
  	"country" varchar,
  	"city" varchar,
  	"region" varchar,
  	"page_count" numeric DEFAULT 0,
  	"session_count" numeric DEFAULT 0,
  	"last_visit" timestamp(3) with time zone,
  	"user_agent" varchar,
  	"first_source" varchar,
  	"first_utm_source" varchar,
  	"first_utm_medium" varchar,
  	"first_utm_campaign" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "page_visits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"title" varchar,
  	"visited_at" timestamp(3) with time zone,
  	"visitor_id" varchar,
  	"session_id" varchar,
  	"is_new_session" boolean DEFAULT false,
  	"time_on_page" numeric,
  	"scroll_depth" numeric,
  	"referrer" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"utm_content" varchar,
  	"utm_term" varchar,
  	"ip_address" varchar,
  	"country" varchar,
  	"city" varchar,
  	"region" varchar,
  	"user_agent" varchar
  );
  
  CREATE TABLE "tracking_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_type" varchar NOT NULL,
  	"event_name" varchar NOT NULL,
  	"properties" varchar,
  	"visitor_id" varchar,
  	"fingerprint_id" varchar,
  	"session_id" varchar,
  	"path" varchar,
  	"occurred_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "article_suggestions_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar
  );
  
  CREATE TABLE "article_suggestions_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "article_suggestions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"gemini_context" varchar,
  	"vertical" "enum_article_suggestions_vertical" NOT NULL,
  	"priority" numeric NOT NULL,
  	"priority_reason" varchar,
  	"scheduled_for" timestamp(3) with time zone,
  	"status" "enum_article_suggestions_status" DEFAULT 'pending' NOT NULL,
  	"discovered_at" timestamp(3) with time zone,
  	"published_post_id" integer,
  	"claude_editorial_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quality_reviews_results_issues" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"issue" varchar
  );
  
  CREATE TABLE "quality_reviews_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"post_id" integer,
  	"title" varchar,
  	"score" numeric,
  	"flag" varchar,
  	"review_note" varchar
  );
  
  CREATE TABLE "quality_reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"run_label" varchar,
  	"scanned_at" timestamp(3) with time zone,
  	"total_scanned" numeric,
  	"flagged" numeric,
  	"avg_score" numeric,
  	"editorial_summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "automation_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"research_provider" "enum_automation_settings_research_provider" DEFAULT 'claude',
  	"scan_news_enabled" boolean DEFAULT true,
  	"re_prioritize_enabled" boolean DEFAULT true,
  	"auto_write_enabled" boolean DEFAULT true,
  	"auto_publish_enabled" boolean DEFAULT true,
  	"weekly_update_enabled" boolean DEFAULT true,
  	"quality_audit_enabled" boolean DEFAULT true,
  	"monthly_update_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "posts" ADD COLUMN "quality_audit_score" numeric;
  ALTER TABLE "posts" ADD COLUMN "quality_audit_flag" "enum_posts_quality_audit_flag";
  ALTER TABLE "posts" ADD COLUMN "quality_audit_review_note" varchar;
  ALTER TABLE "posts" ADD COLUMN "quality_audit_last_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "last_checked_for_updates" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_quality_audit_score" numeric;
  ALTER TABLE "_posts_v" ADD COLUMN "version_quality_audit_flag" "enum__posts_v_version_quality_audit_flag";
  ALTER TABLE "_posts_v" ADD COLUMN "version_quality_audit_review_note" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_quality_audit_last_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_last_checked_for_updates" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "search_logs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "page_views_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "page_visits_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tracking_events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "article_suggestions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quality_reviews_id" integer;
  ALTER TABLE "posts_quality_audit_issues" ADD CONSTRAINT "posts_quality_audit_issues_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_article_updates" ADD CONSTRAINT "posts_article_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_quality_audit_issues" ADD CONSTRAINT "_posts_v_version_quality_audit_issues_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_article_updates" ADD CONSTRAINT "_posts_v_version_article_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_views_pages" ADD CONSTRAINT "page_views_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_suggestions_key_points" ADD CONSTRAINT "article_suggestions_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_suggestions_sources" ADD CONSTRAINT "article_suggestions_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_suggestions" ADD CONSTRAINT "article_suggestions_published_post_id_posts_id_fk" FOREIGN KEY ("published_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quality_reviews_results_issues" ADD CONSTRAINT "quality_reviews_results_issues_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quality_reviews_results"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quality_reviews_results" ADD CONSTRAINT "quality_reviews_results_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quality_reviews_results" ADD CONSTRAINT "quality_reviews_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quality_reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_quality_audit_issues_order_idx" ON "posts_quality_audit_issues" USING btree ("_order");
  CREATE INDEX "posts_quality_audit_issues_parent_id_idx" ON "posts_quality_audit_issues" USING btree ("_parent_id");
  CREATE INDEX "posts_article_updates_order_idx" ON "posts_article_updates" USING btree ("_order");
  CREATE INDEX "posts_article_updates_parent_id_idx" ON "posts_article_updates" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_quality_audit_issues_order_idx" ON "_posts_v_version_quality_audit_issues" USING btree ("_order");
  CREATE INDEX "_posts_v_version_quality_audit_issues_parent_id_idx" ON "_posts_v_version_quality_audit_issues" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_article_updates_order_idx" ON "_posts_v_version_article_updates" USING btree ("_order");
  CREATE INDEX "_posts_v_version_article_updates_parent_id_idx" ON "_posts_v_version_article_updates" USING btree ("_parent_id");
  CREATE INDEX "search_logs_updated_at_idx" ON "search_logs" USING btree ("updated_at");
  CREATE INDEX "search_logs_created_at_idx" ON "search_logs" USING btree ("created_at");
  CREATE INDEX "page_views_pages_order_idx" ON "page_views_pages" USING btree ("_order");
  CREATE INDEX "page_views_pages_parent_id_idx" ON "page_views_pages" USING btree ("_parent_id");
  CREATE INDEX "page_views_visitor_id_idx" ON "page_views" USING btree ("visitor_id");
  CREATE INDEX "page_views_fingerprint_id_idx" ON "page_views" USING btree ("fingerprint_id");
  CREATE INDEX "page_views_updated_at_idx" ON "page_views" USING btree ("updated_at");
  CREATE INDEX "page_views_created_at_idx" ON "page_views" USING btree ("created_at");
  CREATE INDEX "page_visits_path_idx" ON "page_visits" USING btree ("path");
  CREATE INDEX "page_visits_visited_at_idx" ON "page_visits" USING btree ("visited_at");
  CREATE INDEX "page_visits_visitor_id_idx" ON "page_visits" USING btree ("visitor_id");
  CREATE INDEX "page_visits_session_id_idx" ON "page_visits" USING btree ("session_id");
  CREATE INDEX "tracking_events_event_type_idx" ON "tracking_events" USING btree ("event_type");
  CREATE INDEX "tracking_events_visitor_id_idx" ON "tracking_events" USING btree ("visitor_id");
  CREATE INDEX "tracking_events_session_id_idx" ON "tracking_events" USING btree ("session_id");
  CREATE INDEX "tracking_events_occurred_at_idx" ON "tracking_events" USING btree ("occurred_at");
  CREATE INDEX "article_suggestions_key_points_order_idx" ON "article_suggestions_key_points" USING btree ("_order");
  CREATE INDEX "article_suggestions_key_points_parent_id_idx" ON "article_suggestions_key_points" USING btree ("_parent_id");
  CREATE INDEX "article_suggestions_sources_order_idx" ON "article_suggestions_sources" USING btree ("_order");
  CREATE INDEX "article_suggestions_sources_parent_id_idx" ON "article_suggestions_sources" USING btree ("_parent_id");
  CREATE INDEX "article_suggestions_published_post_idx" ON "article_suggestions" USING btree ("published_post_id");
  CREATE INDEX "article_suggestions_updated_at_idx" ON "article_suggestions" USING btree ("updated_at");
  CREATE INDEX "article_suggestions_created_at_idx" ON "article_suggestions" USING btree ("created_at");
  CREATE INDEX "quality_reviews_results_issues_order_idx" ON "quality_reviews_results_issues" USING btree ("_order");
  CREATE INDEX "quality_reviews_results_issues_parent_id_idx" ON "quality_reviews_results_issues" USING btree ("_parent_id");
  CREATE INDEX "quality_reviews_results_order_idx" ON "quality_reviews_results" USING btree ("_order");
  CREATE INDEX "quality_reviews_results_parent_id_idx" ON "quality_reviews_results" USING btree ("_parent_id");
  CREATE INDEX "quality_reviews_results_post_idx" ON "quality_reviews_results" USING btree ("post_id");
  CREATE INDEX "quality_reviews_updated_at_idx" ON "quality_reviews" USING btree ("updated_at");
  CREATE INDEX "quality_reviews_created_at_idx" ON "quality_reviews" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_logs_fk" FOREIGN KEY ("search_logs_id") REFERENCES "public"."search_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_views_fk" FOREIGN KEY ("page_views_id") REFERENCES "public"."page_views"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_visits_fk" FOREIGN KEY ("page_visits_id") REFERENCES "public"."page_visits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tracking_events_fk" FOREIGN KEY ("tracking_events_id") REFERENCES "public"."tracking_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_suggestions_fk" FOREIGN KEY ("article_suggestions_id") REFERENCES "public"."article_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quality_reviews_fk" FOREIGN KEY ("quality_reviews_id") REFERENCES "public"."quality_reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_search_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("search_logs_id");
  CREATE INDEX "payload_locked_documents_rels_page_views_id_idx" ON "payload_locked_documents_rels" USING btree ("page_views_id");
  CREATE INDEX "payload_locked_documents_rels_page_visits_id_idx" ON "payload_locked_documents_rels" USING btree ("page_visits_id");
  CREATE INDEX "payload_locked_documents_rels_tracking_events_id_idx" ON "payload_locked_documents_rels" USING btree ("tracking_events_id");
  CREATE INDEX "payload_locked_documents_rels_article_suggestions_id_idx" ON "payload_locked_documents_rels" USING btree ("article_suggestions_id");
  CREATE INDEX "payload_locked_documents_rels_quality_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("quality_reviews_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_quality_audit_issues" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_article_updates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_quality_audit_issues" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_article_updates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "search_logs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_views_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_views" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_visits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "tracking_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "article_suggestions_key_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "article_suggestions_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "article_suggestions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quality_reviews_results_issues" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quality_reviews_results" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "quality_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "automation_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_quality_audit_issues" CASCADE;
  DROP TABLE "posts_article_updates" CASCADE;
  DROP TABLE "_posts_v_version_quality_audit_issues" CASCADE;
  DROP TABLE "_posts_v_version_article_updates" CASCADE;
  DROP TABLE "search_logs" CASCADE;
  DROP TABLE "page_views_pages" CASCADE;
  DROP TABLE "page_views" CASCADE;
  DROP TABLE "page_visits" CASCADE;
  DROP TABLE "tracking_events" CASCADE;
  DROP TABLE "article_suggestions_key_points" CASCADE;
  DROP TABLE "article_suggestions_sources" CASCADE;
  DROP TABLE "article_suggestions" CASCADE;
  DROP TABLE "quality_reviews_results_issues" CASCADE;
  DROP TABLE "quality_reviews_results" CASCADE;
  DROP TABLE "quality_reviews" CASCADE;
  DROP TABLE "automation_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_search_logs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_page_views_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_page_visits_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_tracking_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_article_suggestions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quality_reviews_fk";
  
  DROP INDEX "payload_locked_documents_rels_search_logs_id_idx";
  DROP INDEX "payload_locked_documents_rels_page_views_id_idx";
  DROP INDEX "payload_locked_documents_rels_page_visits_id_idx";
  DROP INDEX "payload_locked_documents_rels_tracking_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_article_suggestions_id_idx";
  DROP INDEX "payload_locked_documents_rels_quality_reviews_id_idx";
  ALTER TABLE "posts" DROP COLUMN "quality_audit_score";
  ALTER TABLE "posts" DROP COLUMN "quality_audit_flag";
  ALTER TABLE "posts" DROP COLUMN "quality_audit_review_note";
  ALTER TABLE "posts" DROP COLUMN "quality_audit_last_reviewed_at";
  ALTER TABLE "posts" DROP COLUMN "last_checked_for_updates";
  ALTER TABLE "_posts_v" DROP COLUMN "version_quality_audit_score";
  ALTER TABLE "_posts_v" DROP COLUMN "version_quality_audit_flag";
  ALTER TABLE "_posts_v" DROP COLUMN "version_quality_audit_review_note";
  ALTER TABLE "_posts_v" DROP COLUMN "version_quality_audit_last_reviewed_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_last_checked_for_updates";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "search_logs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "page_views_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "page_visits_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tracking_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "article_suggestions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quality_reviews_id";
  DROP TYPE "public"."enum_posts_quality_audit_flag";
  DROP TYPE "public"."enum__posts_v_version_quality_audit_flag";
  DROP TYPE "public"."enum_page_views_device_type";
  DROP TYPE "public"."enum_article_suggestions_vertical";
  DROP TYPE "public"."enum_article_suggestions_status";
  DROP TYPE "public"."enum_automation_settings_research_provider";`)
}
