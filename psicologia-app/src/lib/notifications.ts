export interface NotificationPayload {
  patientName: string;
  patientEmail?: string | null;
  patientPhone?: string | null;
  psychologistName: string;
  sessionDate: string;
  sessionTime: string;
  sessionType: string;
  duration: number;
}

function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function emailTemplate(payload: NotificationPayload) {
  const { patientName, psychologistName, sessionDate, sessionTime, sessionType, duration } = payload;
  const dateBR = formatDateBR(sessionDate);
  const typeLabel = sessionType === "teleconsulta" ? "Teleconsulta" : "Presencial";

  const field = (label: string, value: string) => `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; font-family: Arial, sans-serif; font-size: 13px; color: #6b7280; vertical-align: middle; width: 120px;">${label}</td>
      <td style="padding: 14px 0; border-bottom: 1px solid #f3f4f6; font-family: Arial, sans-serif; font-size: 14px; color: #111827; font-weight: 600; vertical-align: middle; text-align: right;">${value}</td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; background: #f8f9fa; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="max-width: 480px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center; color: #ffffff; font-family: Arial, sans-serif;">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">Sessão Confirmada</h1>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Olá, ${patientName}!</p>
            </td>
          </tr>
          <!-- BODY -->
          <tr>
            <td style="padding: 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${field("Paciente", patientName)}
                ${field("Profissional", psychologistName)}
                ${field("Data", dateBR)}
                ${field("Horário", sessionTime)}
                ${field("Duração", `${duration} minutos`)}
                <tr>
                  <td style="padding: 14px 0; font-family: Arial, sans-serif; font-size: 13px; color: #6b7280; vertical-align: middle; width: 120px;">Modalidade</td>
                  <td style="padding: 14px 0; font-family: Arial, sans-serif; font-size: 14px; color: #111827; font-weight: 600; vertical-align: middle; text-align: right;">${typeLabel}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="padding: 16px 24px; text-align: center; font-size: 12px; color: #9ca3af; background: #f9fafb; font-family: Arial, sans-serif;">
              Sistema Educadamente — Gestão de Psicologia<br/>
              Em caso de dúvidas, entre em contato com a clínica.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function whatsappTemplate(payload: NotificationPayload) {
  const { patientName, psychologistName, sessionDate, sessionTime, sessionType, duration } = payload;
  const dateBR = formatDateBR(sessionDate);
  const typeLabel = sessionType === "teleconsulta" ? "Teleconsulta" : "Presencial";

  return `Olá ${patientName}! Sua sessão foi confirmada:

Profissional: ${psychologistName}
Data: ${dateBR}
Horário: ${sessionTime}
Duração: ${duration} min
Modalidade: ${typeLabel}

Em caso de imprevisto, entre em contato com a clínica.
Sistema Educadamente`;
}

export async function sendSessionNotification(payload: NotificationPayload) {
  const results = { email: false as boolean | string, whatsapp: false as boolean | string };

  // ─── E-mail ───
  if (payload.patientEmail) {
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: payload.patientEmail,
          subject: `Confirmação de Sessão — ${formatDateBR(payload.sessionDate)} às ${payload.sessionTime}`,
          html: emailTemplate(payload),
        }),
      });
      const data = await res.json();
      results.email = data.success ? true : data.error;
    } catch (e: any) {
      results.email = e.message;
    }
  }

  // ─── WhatsApp ───
  if (payload.patientPhone) {
    try {
      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: payload.patientPhone,
          message: whatsappTemplate(payload),
        }),
      });
      const data = await res.json();
      results.whatsapp = data.success ? true : data.error;
    } catch (e: any) {
      results.whatsapp = e.message;
    }
  }

  return results;
}
