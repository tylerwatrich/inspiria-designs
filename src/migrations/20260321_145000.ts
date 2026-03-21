import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ─── article_areas table ───────────────────────────────────────────────────
  // Create with slug field already included so no follow-up migration is needed.
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "article_areas" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "description" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "article_areas_slug_idx" ON "article_areas" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "article_areas_updated_at_idx" ON "article_areas" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "article_areas_created_at_idx" ON "article_areas" USING btree ("created_at");
  `)

  // If the table already existed from dev-mode push (without slug), add the column safely.
  await db.execute(sql`
    ALTER TABLE "article_areas" ADD COLUMN IF NOT EXISTS "slug" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "article_areas_slug_idx" ON "article_areas" USING btree ("slug");
  `)

  // ─── posts.article_area_id ─────────────────────────────────────────────────
  // This FK column was added to the Posts collection but never made it into a migration.
  // It is the root cause of the build failure ("column posts.article_area_id does not exist").
  await db.execute(sql`
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "article_area_id" integer;
    ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_article_area_id" integer;
  `)

  await db.execute(sql`
    ALTER TABLE "posts"
      DROP CONSTRAINT IF EXISTS "posts_article_area_id_article_areas_id_fk";
    ALTER TABLE "posts"
      ADD CONSTRAINT "posts_article_area_id_article_areas_id_fk"
      FOREIGN KEY ("article_area_id") REFERENCES "public"."article_areas"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "posts_article_area_idx" ON "posts" USING btree ("article_area_id");
  `)

  await db.execute(sql`
    ALTER TABLE "_posts_v"
      DROP CONSTRAINT IF EXISTS "_posts_v_version_article_area_id_article_areas_id_fk";
    ALTER TABLE "_posts_v"
      ADD CONSTRAINT "_posts_v_version_article_area_id_article_areas_id_fk"
      FOREIGN KEY ("version_article_area_id") REFERENCES "public"."article_areas"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "_posts_v_version_article_area_idx" ON "_posts_v" USING btree ("version_article_area_id");
  `)

  // ─── payload_locked_documents_rels ────────────────────────────────────────
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "article_areas_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_article_areas_id_idx"
      ON "payload_locked_documents_rels" USING btree ("article_areas_id");
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_article_areas_fk";
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_article_areas_fk"
      FOREIGN KEY ("article_areas_id") REFERENCES "public"."article_areas"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // ─── article_suggestions: smb_relevance ───────────────────────────────────
  // This column was in the collection definition but missing from the initial migration.
  await db.execute(sql`
    ALTER TABLE "article_suggestions" ADD COLUMN IF NOT EXISTS "smb_relevance" numeric;
  `)

  // ─── article_suggestions: expand vertical enum ────────────────────────────
  // Industry Insights verticals
  await db.execute(sql`ALTER TYPE "public"."enum_article_suggestions_vertical" ADD VALUE IF NOT EXISTS 'legal';`)
  await db.execute(sql`ALTER TYPE "public"."enum_article_suggestions_vertical" ADD VALUE IF NOT EXISTS 'contractors';`)
  await db.execute(sql`ALTER TYPE "public"."enum_article_suggestions_vertical" ADD VALUE IF NOT EXISTS 'real-estate';`)
  await db.execute(sql`ALTER TYPE "public"."enum_article_suggestions_vertical" ADD VALUE IF NOT EXISTS 'procurement';`)
  // Resources verticals
  await db.execute(sql`ALTER TYPE "public"."enum_article_suggestions_vertical" ADD VALUE IF NOT EXISTS 'website-basics';`)
  await db.execute(sql`ALTER TYPE "public"."enum_article_suggestions_vertical" ADD VALUE IF NOT EXISTS 'seo';`)
  await db.execute(sql`ALTER TYPE "public"."enum_article_suggestions_vertical" ADD VALUE IF NOT EXISTS 'ecommerce';`)

  // ─── article_suggestions: area field ─────────────────────────────────────
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_article_suggestions_area"
        AS ENUM('canadian-business-news', 'industry-insights', 'resources');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  await db.execute(sql`
    ALTER TABLE "article_suggestions"
      ADD COLUMN IF NOT EXISTS "area" "enum_article_suggestions_area" DEFAULT 'canadian-business-news';
    CREATE INDEX IF NOT EXISTS "article_suggestions_area_idx"
      ON "article_suggestions" USING btree ("area");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "article_suggestions" DROP COLUMN IF EXISTS "area";
    ALTER TABLE "article_suggestions" DROP COLUMN IF EXISTS "smb_relevance";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "article_areas_id";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_article_area_id";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "article_area_id";
    DROP TABLE IF EXISTS "article_areas";
    DROP TYPE IF EXISTS "public"."enum_article_suggestions_area";
  `)
}
