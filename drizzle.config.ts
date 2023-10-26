import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString:
      "postgres://default:xwJpQs4kF8gm@ep-delicate-shape-93533492.eu-central-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require",
  },
  tablesFilter: ["diaproject_*"],
} satisfies Config;
