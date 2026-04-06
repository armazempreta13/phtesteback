
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Declare Deno to avoid TS errors in some IDEs
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    // FIX: Supabase CLI bloqueia nomes iniciando com 'SUPABASE_', então usamos 'SERVICE_ROLE_KEY'
    // Tentamos ler a nossa chave manual, ou a automática se o sistema injetar
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Configuração de servidor incompleta: SERVICE_ROLE_KEY ou SUPABASE_URL não definidos nos Secrets.");
    }

    // 1. Criar cliente Supabase com a chave de ADMIN (Service Role)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { email, password, name } = await req.json()

    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios")
    }

    // 2. Criar o usuário real no sistema de Auth
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirma automaticamente
      user_metadata: {
        full_name: name,
        role: 'client' // Força role de cliente
      }
    })

    if (createError) throw createError

    // 3. Retorna os dados do novo usuário
    return new Response(
      JSON.stringify({ user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error: any) {
    console.error("Erro na criação de usuário:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
