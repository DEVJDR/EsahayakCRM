// app/api/lead/buyers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db/db";
import { buyers } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// Type for the dynamic route parameters
type Params = {
  params: { id: string };
};

// ✅ Update buyer
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params; // Extract id from context.params
    const body = await req.json(); // Parse request body

    // Validate body (optional but recommended)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    await db.update(buyers).set(body).where(eq(buyers.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error updating buyer:", err);
    return NextResponse.json(
      { error: "Failed to update buyer" },
      { status: 500 }
    );
  }
}

// ✅ Delete buyer
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params; // Extract id from context.params

    await db.delete(buyers).where(eq(buyers.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error deleting buyer:", err);
    return NextResponse.json(
      { error: "Failed to delete buyer" },
      { status: 500 }
    );
  }
}