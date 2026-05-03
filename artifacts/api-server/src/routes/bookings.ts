import { Router } from "express";
import { db, bookingsTable, workersTable, categoriesTable } from "@workspace/db";
import { eq, and, type SQL, desc, avg, count } from "drizzle-orm";
import {
  ListBookingsQueryParams,
  CreateBookingBody,
  GetBookingParams,
  UpdateBookingStatusParams,
  UpdateBookingStatusBody,
} from "@workspace/api-zod";

const router = Router();

const bookingWithWorker = {
  id: bookingsTable.id,
  workerId: bookingsTable.workerId,
  workerName: workersTable.displayName,
  workerWallet: workersTable.walletAddress,
  clientWallet: bookingsTable.clientWallet,
  categoryName: categoriesTable.name,
  description: bookingsTable.description,
  rateAmount: workersTable.rateAmount,
  rateCurrency: workersTable.rateCurrency,
  status: bookingsTable.status,
  txHash: bookingsTable.txHash,
  scheduledAt: bookingsTable.scheduledAt,
  clientRating: bookingsTable.clientRating,
  clientReview: bookingsTable.clientReview,
  createdAt: bookingsTable.createdAt,
};

router.get("/bookings", async (req, res) => {
  const parsed = ListBookingsQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { workerId, clientWallet, status } = parsed.data;
  const conditions: SQL[] = [];
  if (workerId) conditions.push(eq(bookingsTable.workerId, workerId));
  if (clientWallet) conditions.push(eq(bookingsTable.clientWallet, clientWallet));
  if (status) conditions.push(eq(bookingsTable.status, status));

  const bookings = await db
    .select(bookingWithWorker)
    .from(bookingsTable)
    .innerJoin(workersTable, eq(bookingsTable.workerId, workersTable.id))
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookingsTable.createdAt));

  return res.json(bookings);
});

router.post("/bookings", async (req, res) => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [worker] = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.id, parsed.data.workerId))
    .limit(1);
  if (!worker) return res.status(404).json({ error: "Worker not found" });

  const [inserted] = await db
    .insert(bookingsTable)
    .values({
      workerId: parsed.data.workerId,
      clientWallet: parsed.data.clientWallet,
      description: parsed.data.description ?? null,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    })
    .returning({ id: bookingsTable.id });

  const [booking] = await db
    .select(bookingWithWorker)
    .from(bookingsTable)
    .innerJoin(workersTable, eq(bookingsTable.workerId, workersTable.id))
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(eq(bookingsTable.id, inserted.id))
    .limit(1);

  return res.status(201).json(booking);
});

router.get("/bookings/:id", async (req, res) => {
  const parsed = GetBookingParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [booking] = await db
    .select(bookingWithWorker)
    .from(bookingsTable)
    .innerJoin(workersTable, eq(bookingsTable.workerId, workersTable.id))
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(eq(bookingsTable.id, parsed.data.id))
    .limit(1);

  if (!booking) return res.status(404).json({ error: "Not found" });
  return res.json(booking);
});

router.patch("/bookings/:id", async (req, res) => {
  const paramsParsed = UpdateBookingStatusParams.safeParse(req.params);
  if (!paramsParsed.success) return res.status(400).json({ error: "Invalid id" });

  const bodyParsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: bodyParsed.error.flatten() });

  const updates: Partial<typeof bookingsTable.$inferInsert> = {};
  if (bodyParsed.data.status) updates.status = bodyParsed.data.status;
  if (bodyParsed.data.txHash !== undefined) updates.txHash = bodyParsed.data.txHash ?? undefined;
  if (bodyParsed.data.clientRating !== undefined) updates.clientRating = bodyParsed.data.clientRating ?? undefined;
  if (bodyParsed.data.clientReview !== undefined) updates.clientReview = bodyParsed.data.clientReview ?? undefined;

  // Fetch current booking to get workerId
  const [existing] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, paramsParsed.data.id)).limit(1);
  if (!existing) return res.status(404).json({ error: "Not found" });

  await db.update(bookingsTable).set(updates).where(eq(bookingsTable.id, paramsParsed.data.id));

  // Recalculate worker stats when status → completed or a rating is submitted
  const statusChangedToCompleted = bodyParsed.data.status === "completed";
  const ratingSubmitted = bodyParsed.data.clientRating !== undefined && bodyParsed.data.clientRating !== null;

  if (statusChangedToCompleted || ratingSubmitted) {
    const [stats] = await db
      .select({
        completedJobs: count(),
        avgRating: avg(bookingsTable.clientRating),
      })
      .from(bookingsTable)
      .where(and(eq(bookingsTable.workerId, existing.workerId), eq(bookingsTable.status, "completed")));

    const workerUpdates: Partial<typeof workersTable.$inferInsert> = {};
    if (statusChangedToCompleted) workerUpdates.completedJobs = Number(stats?.completedJobs ?? 0);
    if (stats?.avgRating != null) workerUpdates.rating = String(parseFloat(stats.avgRating as string).toFixed(2));

    if (Object.keys(workerUpdates).length > 0) {
      await db.update(workersTable).set(workerUpdates).where(eq(workersTable.id, existing.workerId));
    }
  }

  const [booking] = await db
    .select(bookingWithWorker)
    .from(bookingsTable)
    .innerJoin(workersTable, eq(bookingsTable.workerId, workersTable.id))
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(eq(bookingsTable.id, paramsParsed.data.id))
    .limit(1);

  if (!booking) return res.status(404).json({ error: "Not found" });
  return res.json(booking);
});

export default router;
