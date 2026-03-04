import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    "SELECT id, nome FROM funcoes WHERE ativa = true ORDER BY nome"
  );

  return NextResponse.json(result.rows);
}