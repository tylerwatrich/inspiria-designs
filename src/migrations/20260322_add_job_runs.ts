import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ─── Create enum types for job_runs ──────────────────────────────────────────
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_job_runs_job_type"
        AS ENUM('scan-news', 'write-post', 'generate-images', 'quality-audit', 'update-articles');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_job_runs_status"
        AS ENUM('running', 'completed', 'error');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)

  // ─── Create job_runs table ────────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "job_runs" (
      "id"           serial PRIMARY KEY NOT NULL,
      "job_type"     "enum_job_runs_job_type" NOT NULL,
      "status"       "enum_job_runs_status"   NOT NULL,
      "started_at"   timestamp(3) with time zone NOT NULL,
      "completed_at" timestamp(3) with time zone,
      "message"      varchar,
      "updated_at"   timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at"   timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "job_runs_job_type_idx" ON "job_runs" USING btree ("job_type");
    CREATE INDEX IF NOT EXISTS "job_runs_status_idx"   ON "job_runs" USING btree ("status");
    CREATE INDEX IF NOT EXISTS "job_runs_updated_at_idx" ON "job_runs" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "job_runs_created_at_idx" ON "job_runs" USING btree ("created_at");
  `)

  // ─── payload_locked_documents_rels: add job_runs_id FK ───────────────────────
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "job_runs_id" integer;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_job_runs_id_idx"
      ON "payload_locked_documents_rels" USING btree ("job_runs_id");
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_job_runs_fk";
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_job_runs_fk"
      FOREIGN KEY ("job_runs_id") REFERENCES "public"."job_runs"("id") ON DELETE cascade ON UPDATE no action;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "job_runs_id";
    DROP TABLE IF EXISTS "job_runs";
    DROP TYPE IF EXISTS "public"."enum_job_runs_status";
    DROP TYPE IF EXISTS "public"."enum_job_runs_job_type";
  `)
}
