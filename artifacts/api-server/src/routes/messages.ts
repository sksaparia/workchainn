import { Router } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const sendMessageSchema = z.object({
  fromWallet: z.string().min(1),
  toWallet: z.string().min(1),
  content: z.string().min(1).max(2000),
});

router.post("/messages", async (req, res) => {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { fromWallet, toWallet, content } = parsed.data;
  const [msg] = await db.insert(messagesTable).values({ fromWallet, toWallet, content }).returning();
  res.status(201).json(msg);
});

router.get("/messages/inbox/:wallet", async (req, res) => {
  const { wallet } = req.params;

  // Get all messages involving this wallet
  const msgs = await db
    .select()
    .from(messagesTable)
    .where(or(eq(messagesTable.fromWallet, wallet), eq(messagesTable.toWallet, wallet)))
    .orderBy(desc(messagesTable.createdAt));

  // Group into conversations keyed by the OTHER wallet
  const convMap = new Map<string, {
    otherWallet: string;
    lastMessage: string;
    lastMessageAt: Date;
    unreadCount: number;
  }>();

  for (const m of msgs) {
    const other = m.fromWallet === wallet ? m.toWallet : m.fromWallet;
    if (!convMap.has(other)) {
      convMap.set(other, {
        otherWallet: other,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unreadCount: 0,
      });
    }
    // Count unread messages TO this wallet
    if (m.toWallet === wallet && !m.isRead) {
      convMap.get(other)!.unreadCount++;
    }
  }

  res.json(Array.from(convMap.values()));
});

router.get("/messages/conversation", async (req, res) => {
  const { walletA, walletB } = req.query as { walletA?: string; walletB?: string };
  if (!walletA || !walletB) {
    res.status(400).json({ error: "walletA and walletB query params required" });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(
      or(
        and(eq(messagesTable.fromWallet, walletA), eq(messagesTable.toWallet, walletB)),
        and(eq(messagesTable.fromWallet, walletB), eq(messagesTable.toWallet, walletA))
      )
    )
    .orderBy(messagesTable.createdAt);

  res.json(msgs);
});

router.patch("/messages/:id/read", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid message id" });
    return;
  }
  const [msg] = await db.update(messagesTable).set({ isRead: true }).where(eq(messagesTable.id, id)).returning();
  if (!msg) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  res.json(msg);
});

export default router;
