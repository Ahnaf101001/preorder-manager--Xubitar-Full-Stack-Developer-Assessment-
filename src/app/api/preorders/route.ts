import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "all";
  const sortField = searchParams.get("sortField") || "created_at";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  const allowedSortFields = ["name", "created_at", "starts_at", "ends_at"];
  const allowedSortOrders = ["asc", "desc"];
  const safeSort = allowedSortFields.includes(sortField) ? sortField : "created_at";
  const safeOrder = allowedSortOrders.includes(sortOrder) ? sortOrder : "desc";

  let whereClause = "";
  if (filter === "active") whereClause = "WHERE status = 1";
  else if (filter === "inactive") whereClause = "WHERE status = 0";

  const offset = (page - 1) * pageSize;

  const countResult = await db.execute(`SELECT COUNT(*) as total FROM preorders ${whereClause}`);
  const total = Number((countResult.rows[0] as unknown as { total: number }).total);

  const result = await db.execute(
    `SELECT * FROM preorders ${whereClause} ORDER BY ${safeSort} ${safeOrder.toUpperCase()} LIMIT ${pageSize} OFFSET ${offset}`
  );

  return NextResponse.json({
    data: result.rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, products, preorder_when, starts_at, ends_at, status } = body;

  if (!name || !starts_at) {
    return NextResponse.json({ error: "Name and starts_at are required" }, { status: 400 });
  }

  const result = await db.execute({
    sql: `INSERT INTO preorders (name, products, preorder_when, starts_at, ends_at, status, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [
      name,
      products ?? 1,
      preorder_when ?? "regardless-of-stock",
      starts_at,
      ends_at || null,
      status !== undefined ? (status ? 1 : 0) : 1,
    ],
  });

  const newPreorder = await db.execute({
    sql: "SELECT * FROM preorders WHERE id = ?",
    args: [result.lastInsertRowid!],
  });

  return NextResponse.json(newPreorder.rows[0], { status: 201 });
}
