import { NextResponse } from "next/server";
import { writeFileSync, existsSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";

const FILE = join(process.cwd(), "__nudge-result.txt");

export async function POST(req: Request) {
  const { result } = await req.json();
  writeFileSync(FILE, result);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!existsSync(FILE)) return NextResponse.json({ done: false });
  const result = readFileSync(FILE, "utf-8");
  unlinkSync(FILE);
  return NextResponse.json({ done: true, result });
}
