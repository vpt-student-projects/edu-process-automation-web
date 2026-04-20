import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const payload = await request.json();

    console.error("[runtime-monitoring]", payload);

    return NextResponse.json({ ok: true });
}
