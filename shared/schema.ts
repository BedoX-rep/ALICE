import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type Role = "hearts" | "diamonds" | "rectangle" | "joker";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  started: boolean("started").notNull().default(false),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  deviceId: text("device_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

export const insertGameSchema = createInsertSchema(games).omit({ 
  id: true,
  started: true 
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  role: true
});

export const joinGameSchema = z.object({
  code: z.string(),
  name: z.string().min(2).max(20),
  deviceId: z.string()
});

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
