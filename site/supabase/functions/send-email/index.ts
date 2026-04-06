
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createTransport } from "npm:nodemailer@6.9.13"

// Declare Deno to avoid TS errors
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text } = await req.json()

    // Validação básica
    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html')
    }

    // Configuração do Transporter (Google SMTP)
    // IMPORTANTE: Você deve configurar essas variáveis no painel do Supabase ou via CLI
    // supabase secrets set SMTP_USER="seu-email@gmail.com"
    // supabase secrets set SMTP_PASS="sua-senha-de-app-gerada-no-google"
    const transporter = createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
    });

    // Envio do E-mail
    const info = await transporter.sendMail({
      from: `"PH Development" <${Deno.env.get("SMTP_USER")}>`,
      to: to,
      subject: subject,
      text: text || "Visualize este e-mail em um cliente compatível com HTML.",
      html: html,
    });

    console.log("Message sent: %s", info.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // ou 500 dependendo do erro
      }
    )
  }
})