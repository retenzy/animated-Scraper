import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_layout_mode" AS ENUM('blocks', 'puck');
  CREATE TYPE "public"."enum__posts_v_version_layout_mode" AS ENUM('blocks', 'puck');
  ALTER TABLE "posts" ADD COLUMN "layout_mode" "enum_posts_layout_mode" DEFAULT 'blocks';
  ALTER TABLE "posts" ADD COLUMN "puck_content" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_layout_mode" "enum__posts_v_version_layout_mode" DEFAULT 'blocks';
  ALTER TABLE "_posts_v" ADD COLUMN "version_puck_content" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "layout_mode";
  ALTER TABLE "posts" DROP COLUMN "puck_content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_layout_mode";
  ALTER TABLE "_posts_v" DROP COLUMN "version_puck_content";
  DROP TYPE "public"."enum_posts_layout_mode";
  DROP TYPE "public"."enum__posts_v_version_layout_mode";`)
}
