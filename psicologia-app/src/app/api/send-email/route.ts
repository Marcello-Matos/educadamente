import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, text } = await req.json();

    if (!to || (!html && !text)) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    if (!RESEND_API_KEY || !resend) {
      console.warn("[send-email] RESEND_API_KEY não configurado. E-mail não enviado.");
      return NextResponse.json(
        { error: "RESEND_API_KEY não configurado. Adicione ao .env.local" },
        { status: 400 }
      );
    }

    const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const { data, error } = await resend.emails.send({
      from: `Sistema Educadamente <${from}>`,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[Resend] erro:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("[send-email] erro:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
