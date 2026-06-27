import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db.execute({
    sql: "SELECT * FROM preorders WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Preorder not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, products, preorder_when, starts_at, ends_at, status } = body;

  if (!name || !starts_at) {
    return NextResponse.json({ error: "Name and starts_at are required" }, { status: 400 });
  }

  await db.execute({
    sql: `UPDATE preorders SET name=?, products=?, preorder_when=?, starts_at=?, ends_at=?, status=?, updated_at=datetime('now')
          WHERE id=?`,
    args: [
      name,
      products ?? 1,
      preorder_when ?? "regardless-of-stock",
      starts_at,
      ends_at || null,
      status ? 1 : 0,
      id,
    ],
  });

  const updated = await db.execute({
    sql: "SELECT * FROM preorders WHERE id = ?",
    args: [id],
  });

  if (updated.rows.length === 0) {
    return NextResponse.json({ error: "Preorder not found" }, { status: 404 });
  }

  return NextResponse.json(updated.rows[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (typeof body.status === "boolean") {
    await db.execute({
      sql: "UPDATE preorders SET status=?, updated_at=datetime('now') WHERE id=?",
      args: [body.status ? 1 : 0, id],
    });
  }

  const updated = await db.execute({
    sql: "SELECT * FROM preorders WHERE id = ?",
    args: [id],
  });

  if (updated.rows.length === 0) {
    return NextResponse.json({ error: "Preorder not found" }, { status: 404 });
  }

  return NextResponse.json(updated.rows[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await db.execute({
    sql: "SELECT id FROM preorders WHERE id = ?",
    args: [id],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Preorder not found" }, { status: 404 });
  }

  await db.execute({
    sql: "DELETE FROM preorders WHERE id = ?",
    args: [id],
  });

  return NextResponse.json({ success: true });
}
