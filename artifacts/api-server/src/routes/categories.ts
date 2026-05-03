import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq, like, and, type SQL } from "drizzle-orm";
import {
  ListCategoriesQueryParams,
  GetCategoryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (req, res) => {
  const parsed = ListCategoriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { type, industry, search } = parsed.data;

  const conditions: SQL[] = [];
  if (type) conditions.push(eq(categoriesTable.type, type));
  if (industry) conditions.push(eq(categoriesTable.industry, industry));
  if (search) conditions.push(like(categoriesTable.name, `%${search}%`));

  const categories = await db
    .select()
    .from(categoriesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(categoriesTable.industry, categoriesTable.name);

  return res.json(categories);
});

router.get("/categories/industries", async (req, res) => {
  const rows = await db.execute<{
    industry: string;
    type: string;
    count: string;
  }>(
    `SELECT industry, type, COUNT(*)::int as count FROM categories GROUP BY industry, type ORDER BY type, industry`
  );
  return res.json(rows.rows);
});

router.get("/categories/:id", async (req, res) => {
  const parsed = GetCategoryParams.safeParse(req.params);
  if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

  const [category] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, parsed.data.id))
    .limit(1);

  if (!category) return res.status(404).json({ error: "Not found" });
  return res.json(category);
});

export default router;
