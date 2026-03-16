import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create enums (safe — no-op if they already exist)
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_posts_target_business_size" AS ENUM('solo', 'micro', 'small', 'medium', 'large');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_posts_funnel_stage" AS ENUM('awareness', 'consideration', 'conversion');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_posts_cta" AS ENUM('blue', 'trade-compass');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__posts_v_version_target_business_size" AS ENUM('solo', 'micro', 'small', 'medium', 'large');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__posts_v_version_funnel_stage" AS ENUM('awareness', 'consideration', 'conversion');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__posts_v_version_cta" AS ENUM('blue', 'trade-compass');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_leads_source" AS ENUM('homepage', 'trade-compass');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  // New columns on posts (safe — no-op if they already exist)
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN IF NOT EXISTS "article_summary" varchar,
      ADD COLUMN IF NOT EXISTS "url" varchar,
      ADD COLUMN IF NOT EXISTS "funnel_stage" "enum_posts_funnel_stage",
      ADD COLUMN IF NOT EXISTS "ai_generated" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "cta" "enum_posts_cta" DEFAULT 'blue',
      ADD COLUMN IF NOT EXISTS "article_type_id" integer,
      ADD COLUMN IF NOT EXISTS "meta_primary_keyword" varchar,
      ADD COLUMN IF NOT EXISTS "meta_target_keyword" varchar;
  `)

  // New columns on _posts_v
  await db.execute(sql`
    ALTER TABLE "_posts_v"
      ADD COLUMN IF NOT EXISTS "version_article_summary" varchar,
      ADD COLUMN IF NOT EXISTS "version_url" varchar,
      ADD COLUMN IF NOT EXISTS "version_funnel_stage" "enum__posts_v_version_funnel_stage",
      ADD COLUMN IF NOT EXISTS "version_ai_generated" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "version_cta" "enum__posts_v_version_cta" DEFAULT 'blue',
      ADD COLUMN IF NOT EXISTS "version_article_type_id" integer,
      ADD COLUMN IF NOT EXISTS "version_meta_primary_keyword" varchar,
      ADD COLUMN IF NOT EXISTS "version_meta_target_keyword" varchar;
  `)

  // article_types table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "article_types" (
      "id" serial PRIMARY KEY NOT NULL,
      "label" varchar NOT NULL,
      "description" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "article_types_updated_at_idx" ON "article_types" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "article_types_created_at_idx" ON "article_types" USING btree ("created_at");
  `)

  // industries table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "industries" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "description" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "industries_updated_at_idx" ON "industries" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "industries_created_at_idx" ON "industries" USING btree ("created_at");
  `)

  // leads table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "leads" (
      "id" serial PRIMARY KEY NOT NULL,
      "email" varchar NOT NULL,
      "name" varchar,
      "source" "enum_leads_source",
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "leads_created_at_idx" ON "leads" USING btree ("created_at");
  `)

  // faqs table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "faqs" (
      "id" serial PRIMARY KEY NOT NULL,
      "question" varchar NOT NULL,
      "answer" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  `)

  // posts_key_takeaways table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_key_takeaways" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "point" varchar
    );
    CREATE INDEX IF NOT EXISTS "posts_key_takeaways_order_idx" ON "posts_key_takeaways" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "posts_key_takeaways_parent_id_idx" ON "posts_key_takeaways" USING btree ("_parent_id");
    ALTER TABLE "posts_key_takeaways"
      DROP CONSTRAINT IF EXISTS "posts_key_takeaways_parent_id_fk";
    ALTER TABLE "posts_key_takeaways"
      ADD CONSTRAINT "posts_key_takeaways_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // posts_target_business_size table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_target_business_size" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum_posts_target_business_size",
      "id" serial PRIMARY KEY NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "posts_target_business_size_order_idx" ON "posts_target_business_size" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "posts_target_business_size_parent_idx" ON "posts_target_business_size" USING btree ("parent_id");
    ALTER TABLE "posts_target_business_size"
      DROP CONSTRAINT IF EXISTS "posts_target_business_size_parent_fk";
    ALTER TABLE "posts_target_business_size"
      ADD CONSTRAINT "posts_target_business_size_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // posts_populated_authors table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_populated_authors" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "name" varchar
    );
    CREATE INDEX IF NOT EXISTS "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
    ALTER TABLE "posts_populated_authors"
      DROP CONSTRAINT IF EXISTS "posts_populated_authors_parent_id_fk";
    ALTER TABLE "posts_populated_authors"
      ADD CONSTRAINT "posts_populated_authors_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // _posts_v_version_key_takeaways table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_posts_v_version_key_takeaways" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "point" varchar,
      "_uuid" varchar
    );
    CREATE INDEX IF NOT EXISTS "_posts_v_version_key_takeaways_order_idx" ON "_posts_v_version_key_takeaways" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_posts_v_version_key_takeaways_parent_id_idx" ON "_posts_v_version_key_takeaways" USING btree ("_parent_id");
    ALTER TABLE "_posts_v_version_key_takeaways"
      DROP CONSTRAINT IF EXISTS "_posts_v_version_key_takeaways_parent_id_fk";
    ALTER TABLE "_posts_v_version_key_takeaways"
      ADD CONSTRAINT "_posts_v_version_key_takeaways_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // _posts_v_version_target_business_size table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_posts_v_version_target_business_size" (
      "order" integer NOT NULL,
      "parent_id" integer NOT NULL,
      "value" "enum__posts_v_version_target_business_size",
      "id" serial PRIMARY KEY NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "_posts_v_version_target_business_size_order_idx" ON "_posts_v_version_target_business_size" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "_posts_v_version_target_business_size_parent_idx" ON "_posts_v_version_target_business_size" USING btree ("parent_id");
    ALTER TABLE "_posts_v_version_target_business_size"
      DROP CONSTRAINT IF EXISTS "_posts_v_version_target_business_size_parent_fk";
    ALTER TABLE "_posts_v_version_target_business_size"
      ADD CONSTRAINT "_posts_v_version_target_business_size_parent_fk"
      FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // _posts_v_version_populated_authors table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_posts_v_version_populated_authors" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_uuid" varchar,
      "name" varchar
    );
    CREATE INDEX IF NOT EXISTS "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
    ALTER TABLE "_posts_v_version_populated_authors"
      DROP CONSTRAINT IF EXISTS "_posts_v_version_populated_authors_parent_id_fk";
    ALTER TABLE "_posts_v_version_populated_authors"
      ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // target_audience_keywords table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "target_audience_keywords" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "keyword" varchar NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "target_audience_keywords_order_idx" ON "target_audience_keywords" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "target_audience_keywords_parent_id_idx" ON "target_audience_keywords" USING btree ("_parent_id");
  `)

  // Add faqs_id to posts_rels
  await db.execute(sql`
    ALTER TABLE "posts_rels" ADD COLUMN IF NOT EXISTS "faqs_id" integer;
    CREATE INDEX IF NOT EXISTS "posts_rels_faqs_id_idx" ON "posts_rels" USING btree ("faqs_id");
    ALTER TABLE "posts_rels"
      DROP CONSTRAINT IF EXISTS "posts_rels_faqs_fk";
    ALTER TABLE "posts_rels"
      ADD CONSTRAINT "posts_rels_faqs_fk"
      FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // Add faqs_id to _posts_v_rels
  await db.execute(sql`
    ALTER TABLE "_posts_v_rels" ADD COLUMN IF NOT EXISTS "faqs_id" integer;
    CREATE INDEX IF NOT EXISTS "_posts_v_rels_faqs_id_idx" ON "_posts_v_rels" USING btree ("faqs_id");
    ALTER TABLE "_posts_v_rels"
      DROP CONSTRAINT IF EXISTS "_posts_v_rels_faqs_fk";
    ALTER TABLE "_posts_v_rels"
      ADD CONSTRAINT "_posts_v_rels_faqs_fk"
      FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // Add faqs_id + other new cols to payload_locked_documents_rels
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "article_types_id" integer,
      ADD COLUMN IF NOT EXISTS "industries_id" integer,
      ADD COLUMN IF NOT EXISTS "leads_id" integer,
      ADD COLUMN IF NOT EXISTS "faqs_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_article_types_id_idx" ON "payload_locked_documents_rels" USING btree ("article_types_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_industries_id_idx" ON "payload_locked_documents_rels" USING btree ("industries_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_article_types_fk";
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_article_types_fk"
      FOREIGN KEY ("article_types_id") REFERENCES "public"."article_types"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_industries_fk";
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_industries_fk"
      FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_leads_fk";
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_leads_fk"
      FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_faqs_fk";
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk"
      FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // Add article_type FK on posts
  await db.execute(sql`
    ALTER TABLE "posts"
      DROP CONSTRAINT IF EXISTS "posts_article_type_id_article_types_id_fk";
    ALTER TABLE "posts"
      ADD CONSTRAINT "posts_article_type_id_article_types_id_fk"
      FOREIGN KEY ("article_type_id") REFERENCES "public"."article_types"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "posts_article_type_idx" ON "posts" USING btree ("article_type_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts_rels" DROP COLUMN IF EXISTS "faqs_id";
    ALTER TABLE "_posts_v_rels" DROP COLUMN IF EXISTS "faqs_id";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "faqs_id",
      DROP COLUMN IF EXISTS "article_types_id",
      DROP COLUMN IF EXISTS "industries_id",
      DROP COLUMN IF EXISTS "leads_id";
    DROP TABLE IF EXISTS "faqs";
    DROP TABLE IF EXISTS "posts_key_takeaways";
    DROP TABLE IF EXISTS "posts_target_business_size";
    DROP TABLE IF EXISTS "posts_populated_authors";
    DROP TABLE IF EXISTS "_posts_v_version_key_takeaways";
    DROP TABLE IF EXISTS "_posts_v_version_target_business_size";
    DROP TABLE IF EXISTS "_posts_v_version_populated_authors";
    DROP TABLE IF EXISTS "article_types";
    DROP TABLE IF EXISTS "industries";
    DROP TABLE IF EXISTS "leads";
    DROP TABLE IF EXISTS "target_audience_keywords";
  `)
}
