import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

// Inicializa o SDK do Stripe com a chave secreta protegida no Supabase Secrets
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

// Configuração de CORS para permitir que seu frontend React chame esta função
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Trata a requisição de preflight do navegador (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, email, planName } = await req.json()
    const priceId = Deno.env.get('STRIPE_PRO_PRICE_ID') // Ex: price_1Oxxx...

    // Cria a sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email, // Preenche o e-mail no checkout para poupar tempo
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Redirecionamentos após o pagamento ou cancelamento
      success_url: `${Deno.env.get('PUBLIC_APP_URL')}/sucesso`,
      cancel_url: `${Deno.env.get('PUBLIC_APP_URL')}/planos`,
      // MÁGICA: O Stripe devolverá este ID para o seu webhook quando o pagamento for aprovado
      client_reference_id: userId, 
    })

    return new Response(JSON.stringify({ url: session.url }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})