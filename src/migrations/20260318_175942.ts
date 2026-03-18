import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "hero_image_url" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_hero_image_url" varchar;
  ALTER TABLE "article_suggestions" ADD COLUMN "smb_relevance" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "hero_image_url";
  ALTER TABLE "_posts_v" DROP COLUMN "version_hero_image_url";
  ALTER TABLE "article_suggestions" DROP COLUMN "smb_relevance";`)
}
