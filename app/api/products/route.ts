import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { ProductDB } from "@/lib/products-db";

export async function GET() {
  try {
    const db = await getDatabase();
    const products = await db
      .collection<ProductDB>("products")
      .find({ status: "Publié" }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(
      { success: true, count: products.length, products },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("RadiWood GET public products:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de charger les créations." },
      { status: 500 }
    );
  }
}