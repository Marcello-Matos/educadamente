import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ error: "Telefone e mensagem são obrigatórios" }, { status: 400 });
    }

    // 1. CallMeBot (gratuito para testes)
    const callmebotKey = process.env.CALLMEBOT_API_KEY;
    if (callmebotKey) {
      const cleanPhone = phone.replace(/\D/g, "");
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${callmebotKey}`;
      const res = await fetch(url, { method: "GET" });
      const text = await res.text();
      if (text.includes("success") || res.ok) {
        return NextResponse.json({ success: true, provider: "callmebot" });
      }
    }

    // 2. Z-API (serviço brasileiro pago)
    const zapiToken = process.env.ZAPI_TOKEN;
    const zapiInstance = process.env.ZAPI_INSTANCE;
    if (zapiToken && zapiInstance) {
      const cleanPhone = phone.replace(/\D/g, "");
      const url = `https://api.z-api.io/instances/${zapiInstance}/token/${zapiToken}/messages/text`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Client-Token": zapiToken },
        body: JSON.stringify({ phone: cleanPhone, message }),
      });
      if (res.ok) {
        return NextResponse.json({ success: true, provider: "zapi" });
      }
    }

    // 3. Twilio
    const twilioSid = process.env.TWILIO_SID;
    const twilioToken = process.env.TWILIO_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM;
    if (twilioSid && twilioToken && twilioFrom) {
      const cleanPhone = phone.startsWith("+") ? phone : `+55${phone.replace(/\D/g, "")}`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ From: twilioFrom, To: `whatsapp:${cleanPhone}`, Body: message }),
      });
      if (res.ok) {
        return NextResponse.json({ success: true, provider: "twilio" });
      }
    }

    return NextResponse.json(
      { error: "Nenhum provedor de WhatsApp configurado. Configure CALLMEBOT_API_KEY, ZAPI_TOKEN ou TWILIO_SID." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[send-whatsapp] erro:", err);
    return NextResponse.json({ error: err.message || "Erro interno" }, { status: 500 });
  }
}
