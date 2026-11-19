import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDatabase } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/api-helpers";
import type { CustomerMessage, MessageSource } from "@/lib/messages";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Non autorisé." },
      { status: 401 }
    );
  }

  try {
    const db = await getDatabase();
    const messages = await db
      .collection<CustomerMessage>("messages")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    return NextResponse.json(
      { success: true, messages },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("RadiWood GET messages:", error);
    return NextResponse.json(
      { success: false, error: "Erreur de chargement." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const subject =
      typeof body.subject === "string" && body.subject.trim()
        ? body.subject.trim()
        : "Demande client";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const source: MessageSource =
      body.source === "Sur mesure" ? "Sur mesure" : "Contact";

    if (
      name.length < 2 ||
      message.length < 2 ||
      (email.length === 0 && phone.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Veuillez renseigner votre nom, un contact (e-mail ou téléphone) et votre message.",
        },
        { status: 400 }
      );
    }

    const newMessage: CustomerMessage = {
      id: randomUUID(),
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      phone: phone.slice(0, 40),
      subject: subject.slice(0, 200),
      message: message.slice(0, 5000),
      source,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const db = await getDatabase();
    await db.collection<CustomerMessage>("messages").insertOne({ ...newMessage });

    return NextResponse.json(
      { success: true, message: "Message envoyé avec succès." },
      { status: 201 }
    );
  } catch (error) {
    console.error("RadiWood POST message:", error);
    return NextResponse.json(
      { success: false, error: "Impossible d'envoyer le message." },
      { status: 500 }
    );
  }
}