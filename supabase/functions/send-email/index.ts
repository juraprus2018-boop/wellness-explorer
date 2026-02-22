import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SMTP_HOST = "saunaboeken.com";
const SMTP_PORT = 465;
const SMTP_USER = "info@saunaboeken.com";
const ADMIN_EMAIL = "info@saunaboeken.com";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD');
    if (!SMTP_PASSWORD) {
      throw new Error('SMTP_PASSWORD is not configured');
    }

    const { type, data } = await req.json();

    let subject = "";
    let htmlBody = "";

    if (type === "contact") {
      // Contact form submission
      subject = `Nieuw contactformulier: ${data.subject || "Geen onderwerp"}`;
      htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#2d9f93">Nieuw contactbericht via saunaboeken.com</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Naam:</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(data.name)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">E-mail:</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(data.email)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Onderwerp:</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(data.subject || "-")}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:8px">
            <p style="margin:0;white-space:pre-wrap">${escapeHtml(data.message)}</p>
          </div>
        </div>
      `;
    } else if (type === "review") {
      // New review notification
      subject = `Nieuwe review: ${data.sauna_name} — ${data.rating}⭐`;
      htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#2d9f93">Nieuwe review op saunaboeken.com</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Sauna:</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(data.sauna_name)}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Door:</td><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(data.reviewer_name)} (${escapeHtml(data.reviewer_email)})</td></tr>
            <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">Beoordeling:</td><td style="padding:8px;border-bottom:1px solid #eee">${"⭐".repeat(data.rating)}</td></tr>
          </table>
          ${data.review_text ? `<div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:8px"><p style="margin:0;white-space:pre-wrap">${escapeHtml(data.review_text)}</p></div>` : ""}
        </div>
      `;
    } else {
      throw new Error("Invalid email type");
    }

    const client = new SmtpClient();
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER,
      password: SMTP_PASSWORD,
    });

    await client.send({
      from: SMTP_USER,
      to: ADMIN_EMAIL,
      subject,
      content: htmlBody,
      html: htmlBody,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send email error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
