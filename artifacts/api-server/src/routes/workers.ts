import { Router } from "express";
import { db, workersTable, categoriesTable } from "@workspace/db";
import { eq, like, and, gte, lte, desc, asc, isNotNull, type SQL } from "drizzle-orm";
import {
  ListWorkersQueryParams,
  CreateWorkerBody,
  GetWorkerParams,
  UpdateWorkerParams,
  UpdateWorkerBody,
} from "@workspace/api-zod";

const router = Router();

const workerWithCategory = {
  id: workersTable.id,
  walletAddress: workersTable.walletAddress,
  displayName: workersTable.displayName,
  bio: workersTable.bio,
  avatarUrl: workersTable.avatarUrl,
  categoryId: workersTable.categoryId,
  categoryName: categoriesTable.name,
  categoryType: categoriesTable.type,
  industry: categoriesTable.industry,
  rateAmount: workersTable.rateAmount,
  rateCurrency: workersTable.rateCurrency,
  rateType: workersTable.rateType,
  country: workersTable.country,
  state: workersTable.state,
  city: workersTable.city,
  paymentAddress: workersTable.paymentAddress,
  advanceDepositPercent: workersTable.advanceDepositPercent,
  isAvailable: workersTable.isAvailable,
  completedJobs: workersTable.completedJobs,
  rating: workersTable.rating,
  createdAt: workersTable.createdAt,
};

router.get("/workers", async (req, res) => {
  const parsed = ListWorkersQueryParams.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { type, categoryId, search, country, state, city, minRate, maxRate, available } = parsed.data;

  const conditions: SQL[] = [];
  if (type) conditions.push(eq(categoriesTable.type, type));
  if (categoryId) conditions.push(eq(workersTable.categoryId, categoryId));
  if (search) conditions.push(like(workersTable.displayName, `%${search}%`));
  if (country) conditions.push(eq(workersTable.country, country));
  if (state) conditions.push(eq(workersTable.state, state));
  if (city) conditions.push(eq(workersTable.city, city));
  if (minRate !== undefined) conditions.push(gte(workersTable.rateAmount, String(minRate)));
  if (maxRate !== undefined) conditions.push(lte(workersTable.rateAmount, String(maxRate)));
  if (available !== undefined) conditions.push(eq(workersTable.isAvailable, available));
  if ((parsed.data as any).minRating !== undefined) {
    const mr = (parsed.data as any).minRating;
    conditions.push(gte(workersTable.rating, String(mr)));
  }

  const sortByParam = (parsed.data as any).sortBy as string | undefined;
  let orderClause;
  switch (sortByParam) {
    case "rating":
      orderClause = [desc(workersTable.rating)];
      break;
    case "completedJobs":
      orderClause = [desc(workersTable.completedJobs)];
      break;
    case "rateAsc":
      orderClause = [asc(workersTable.rateAmount)];
      break;
    case "rateDesc":
      orderClause = [desc(workersTable.rateAmount)];
      break;
    default:
      orderClause = [desc(workersTable.createdAt)];
  }

  const workers = await db
    .select(workerWithCategory)
    .from(workersTable)
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderClause);

  return res.json(workers);
});

router.post("/workers", async (req, res) => {
  const parsed = CreateWorkerBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [existing] = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.walletAddress, parsed.data.walletAddress))
    .limit(1);

  if (existing) {
    // Return existing worker profile with joins
    const [worker] = await db
      .select(workerWithCategory)
      .from(workersTable)
      .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
      .where(eq(workersTable.id, existing.id))
      .limit(1);
    return res.status(200).json(worker);
  }

  const [inserted] = await db
    .insert(workersTable)
    .values(parsed.data)
    .returning({ id: workersTable.id });

  const [worker] = await db
    .select(workerWithCategory)
    .from(workersTable)
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(eq(workersTable.id, inserted.id))
    .limit(1);

  return res.status(201).json(worker);
});

router.get("/workers/by-wallet/:wallet", async (req, res) => {
  const wallet = req.params.wallet?.toLowerCase();
  if (!wallet) return res.status(400).json({ error: "wallet required" });

  const [worker] = await db
    .select(workerWithCategory)
    .from(workersTable)
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(eq(workersTable.walletAddress, wallet))
    .limit(1);

  if (!worker) return res.status(404).json({ error: "Not found" });
  return res.json(worker);
});

router.get("/workers/:id", async (req, res) => {
  const parsed = GetWorkerParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [worker] = await db
    .select(workerWithCategory)
    .from(workersTable)
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(eq(workersTable.id, parsed.data.id))
    .limit(1);

  if (!worker) return res.status(404).json({ error: "Not found" });
  return res.json(worker);
});

router.put("/workers/:id", async (req, res) => {
  const paramsParsed = UpdateWorkerParams.safeParse(req.params);
  if (!paramsParsed.success) return res.status(400).json({ error: "Invalid id" });

  const bodyParsed = UpdateWorkerBody.safeParse(req.body);
  if (!bodyParsed.success) return res.status(400).json({ error: bodyParsed.error.flatten() });

  const updates: Partial<typeof workersTable.$inferInsert> = {};
  const body = bodyParsed.data;
  if (body.displayName !== undefined) updates.displayName = body.displayName;
  if (body.bio !== undefined) updates.bio = body.bio ?? undefined;
  if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl ?? undefined;
  if (body.rateAmount !== undefined) updates.rateAmount = body.rateAmount;
  if (body.rateCurrency !== undefined) updates.rateCurrency = body.rateCurrency;
  if (body.rateType !== undefined) updates.rateType = body.rateType;
  if (body.country !== undefined) updates.country = body.country ?? undefined;
  if (body.state !== undefined) updates.state = body.state ?? undefined;
  if (body.city !== undefined) updates.city = body.city ?? undefined;
  if ((body as any).paymentAddress !== undefined) updates.paymentAddress = (body as any).paymentAddress ?? undefined;
  if (body.advanceDepositPercent !== undefined) updates.advanceDepositPercent = body.advanceDepositPercent ?? undefined;
  if (body.isAvailable !== undefined) updates.isAvailable = body.isAvailable;

  await db.update(workersTable).set(updates).where(eq(workersTable.id, paramsParsed.data.id));

  const [worker] = await db
    .select(workerWithCategory)
    .from(workersTable)
    .innerJoin(categoriesTable, eq(workersTable.categoryId, categoriesTable.id))
    .where(eq(workersTable.id, paramsParsed.data.id))
    .limit(1);

  if (!worker) return res.status(404).json({ error: "Not found" });
  return res.json(worker);
});

export default router;
