// app/api/lead/buyers/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db/db";
import { buyers } from "@/src/db/schema";
import { eq } from "drizzle-orm";

type Params = {
  params: { id: string };
};

// ✅ Update buyer
export async function PUT(req: Request, { params }: Params) {
  try {
    const id = params.id;
    const body = await req.json();

    await db.update(buyers).set(body).where(eq(buyers.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating buyer:", err);
    return NextResponse.json(
      { error: "Failed to update buyer" },
      { status: 500 }
    );
  }
}

// ✅ Delete buyer
export async function DELETE(req: Request, { params }: Params) {
  try {
    const id = params.id;

    await db.delete(buyers).where(eq(buyers.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting buyer:", err);
    return NextResponse.json(
      { error: "Failed to delete buyer" },
      { status: 500 }
    );
  }
}
