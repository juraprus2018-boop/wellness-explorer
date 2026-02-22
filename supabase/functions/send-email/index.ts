import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.16";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true, // SSL on port 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Saunaboeken.com" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject,
      html: htmlBody,
    });

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
