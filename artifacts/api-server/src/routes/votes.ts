import { Router, type IRouter } from "express";
import { count, eq, sql } from "drizzle-orm";
import { db, votesTable } from "@workspace/db";
import { z } from "zod/v4";

const router: IRouter = Router();

// GET /api/votes — current totals
router.get("/votes", async (req, res) => {
  try {
    const rows = await db
      .select({ company: votesTable.company, total: count() })
      .from(votesTable)
      .groupBy(votesTable.company);

    const totals: Record<string, number> = { faysal: 0, new: 0 };
    for (const row of rows) {
      totals[row.company] = row.total;
    }

    res.json({ faysal: totals["faysal"], new: totals["new"] });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch votes");
    res.status(500).json({ error: "Failed to fetch votes" });
  }
});

// POST /api/votes — cast a vote
router.post("/votes", async (req, res) => {
  const body = z
    .object({
      company: z.enum(["faysal", "new"]),
      userId: z.string().min(1).max(128),
    })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    // Check if user already voted
    const existing = await db
      .select({ id: votesTable.id })
      .from(votesTable)
      .where(eq(votesTable.userId, body.data.userId))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Already voted", alreadyVoted: true });
      return;
    }

    await db.insert(votesTable).values({
      company: body.data.company,
      userId: body.data.userId,
    });

    // Return updated totals
    const rows = await db
      .select({ company: votesTable.company, total: count() })
      .from(votesTable)
      .groupBy(votesTable.company);

    const totals: Record<string, number> = { faysal: 0, new: 0 };
    for (const row of rows) {
      totals[row.company] = row.total;
    }

    res.status(201).json({ faysal: totals["faysal"], new: totals["new"] });
  } catch (err) {
    req.log.error({ err }, "Failed to cast vote");
    res.status(500).json({ error: "Failed to cast vote" });
  }
});

// GET /api/votes/stats — admin stats
router.get("/votes/stats", async (req, res) => {
  try {
    const rows = await db
      .select({ company: votesTable.company, total: count() })
      .from(votesTable)
      .groupBy(votesTable.company);

    const totalAll = rows.reduce((sum, r) => sum + r.total, 0);
    const totals: Record<string, number> = { faysal: 0, new: 0 };
    for (const row of rows) {
      totals[row.company] = row.total;
    }

    const last24h = await db
      .select({ company: votesTable.company, total: count() })
      .from(votesTable)
      .where(sql`created_at > now() - interval '24 hours'`)
      .groupBy(votesTable.company);

    const recent: Record<string, number> = { faysal: 0, new: 0 };
    for (const row of last24h) {
      recent[row.company] = row.total;
    }

    res.json({
      totals,
      totalAll,
      last24h: recent,
      faysalPct: totalAll > 0 ? Math.round((totals["faysal"] / totalAll) * 100) : 50,
      newPct: totalAll > 0 ? Math.round((totals["new"] / totalAll) * 100) : 50,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// DELETE /api/votes/reset — reset all votes (admin)
router.delete("/votes/reset", async (req, res) => {
  const secret = req.headers["x-admin-secret"];
  if (secret !== process.env["ADMIN_SECRET"] && process.env["ADMIN_SECRET"]) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    await db.delete(votesTable);
    res.json({ success: true, message: "All votes have been reset" });
  } catch (err) {
    req.log.error({ err }, "Failed to reset votes");
    res.status(500).json({ error: "Failed to reset votes" });
  }
});

export default router;
