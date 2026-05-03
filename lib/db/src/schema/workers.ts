import { pgTable, serial, text, boolean, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const currencyEnum = pgEnum("currency", ["ETH", "MATIC", "USDC", "USDT", "BNB", "BTC", "SOL"]);
export const rateTypeEnum = pgEnum("rate_type", ["hourly", "task"]);

export const workersTable = pgTable("workers", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  rateAmount: numeric("rate_amount", { precision: 18, scale: 8 }).notNull(),
  rateCurrency: currencyEnum("rate_currency").notNull(),
  rateType: rateTypeEnum("rate_type").notNull(),
  country: text("country"),
  state: text("state"),
  city: text("city"),
  paymentAddress: text("payment_address"),
  advanceDepositPercent: integer("advance_deposit_percent"),
  isAvailable: boolean("is_available").notNull().default(true),
  completedJobs: integer("completed_jobs").notNull().default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWorkerSchema = createInsertSchema(workersTable).omit({ id: true, createdAt: true, completedJobs: true });
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workersTable.$inferSelect;
