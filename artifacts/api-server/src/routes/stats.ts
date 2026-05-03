import { Router } from "express";
import { db, workersTable, bookingsTable, categoriesTable } from "@workspace/db";
import { eq, desc, count, sql } from "drizzle-orm";
import { GetRecentBookingsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/stats/overview", async (req, res) => {
  const [workerStats] = await db
    .select({
      totalWorkers: count(),
      availableWorkers: sql<number>`SUM(CASE WHEN ${workersTable.isAvailable} THEN 1 ELSE 0 END)::int`,
    })
    .from(workersTable);

  const [bookingStats] = await db
    .select({
      totalBookings: count(),
      completedBookings: sql<number>`SUM(CASE WHEN ${bookingsTable.status} = 'completed' THEN 1 ELSE 0 END)::int`,
    })
    .from(bookingsTable);

  const [catStats] = await db
    .select({
      totalCategories: count(),
      manualCategories: sql<number>`SUM(CASE WHEN ${categoriesTable.type} = 'manual' THEN 1 ELSE 0 END)::int`,
      onlineCategories: sql<number>`SUM(CASE WHEN ${categoriesTable.type} = 'online' THEN 1 ELSE 0 END)::int`,
    })
    .from(categoriesTable);

  return res.json({
    totalWorkers: workerStats?.totalWorkers ?? 0,
    availableWorkers: workerStats?.availableWorkers ?? 0,
    totalBookings: bookingStats?.totalBookings ?? 0,
    completedBookings: bookingStats?.completedBookings ?? 0,
    totalCategories: catStats?.totalCategories ?? 0,
    manualCategories: catStats?.manualCategories ?? 0,
    onlineCategories: catStats?.onlineCategories ?? 0,
  });
});

router.get("/stats/top-categories", async (req, res) => {
  const rows = await db
    .select({
      categoryId: workersTable.categoryId,
      categoryName: categoriesTable.name,
      industry: categoriesTable.industry,
      type: categoriesTable.type,
      workerCount: count(workersTable.id),
    })
    .from(workersTable)
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .groupBy(workersTable.categoryId, categoriesTable.name, categoriesTable.industry, categoriesTable.type)
    .orderBy(desc(count(workersTable.id)))
    .limit(10);

  return res.json(rows);
});

router.get("/stats/recent-bookings", async (req, res) => {
  const parsed = GetRecentBookingsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;

  const bookings = await db
    .select({
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
      createdAt: bookingsTable.createdAt,
    })
    .from(bookingsTable)
    .innerJoin(workersTable, eq(bookingsTable.workerId, workersTable.id))
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .orderBy(desc(bookingsTable.createdAt))
    .limit(limit);

  return res.json(bookings);
});

export default router;
