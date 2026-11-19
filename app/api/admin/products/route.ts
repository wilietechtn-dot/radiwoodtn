import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDatabase } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/api-helpers";
import type { ProductDB } from "@/lib/products-db";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Non autorisé." },
      { status: 401 }
    );
  }

  try {
    const db = await getDatabase();
    const products = await db
      .collection<ProductDB>("products")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json(
      { success: true, count: products.length, products },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("RadiWood GET admin products:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de charger les produits." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Non autorisé." },
      { status: 401 }
    );
  }

  const originError = verifySameOrigin(request);
  if (originError) return originError;

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const price = Number(body.price);
    const status = body.status === "Brouillon" ? "Brouillon" : "Publié";

    const rawImages = Array.isArray(body.images)
      ? body.images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
      : [];
    const singleImage =
      typeof body.image === "string" && body.image.trim().length > 0
        ? body.image.trim()
        : rawImages[0] ?? "/images/plateau.jpg";

    const images = rawImages.length > 0 ? rawImages.slice(0, 4) : [singleImage];

    if (!name || !category || Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Veuillez renseigner le nom, la catégorie et un prix valide.",
        },
        { status: 400 }
      );
    }

    const id = randomUUID();
    const now = new Date().toISOString();
    const slug = `${slugify(name) || "creation"}-${id.slice(0, 6)}`;

    const newProduct = {
      id,
      slug,
      name: name.slice(0, 150),
      category: category.slice(0, 100),
      price,
      description: description.slice(0, 5000),
      image: singleImage,
      images,
      status,
      featured: Boolean(body.featured),
      inStock: body.inStock !== false,
      dimensions:
        typeof body.dimensions === "string" ? body.dimensions.trim().slice(0, 120) : "",
      material:
        typeof body.material === "string" && body.material.trim()
          ? body.material.trim().slice(0, 120)
          : "Bois d'olivier naturel",
      createdAt: now,
      updatedAt: now,
    } as unknown as ProductDB;

    const db = await getDatabase();
    await db.collection<ProductDB>("products").insertOne({ ...newProduct });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("RadiWood POST admin product:", error);
    return NextResponse.json(
      { success: false, error: "Impossible d'enregistrer le produit." },
      { status: 500 }
    );
  }
}