import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userDescription, flowerType, musicChoice, isAuthenticated } = await req.json();
    const descriptionFragment = typeof userDescription === "string" && userDescription.trim().length > 0
      ? " I see the care and intention you bring to your growth."
      : "";
    const flowerFragment = typeof flowerType === "string" && flowerType.trim().length > 0
      ? ` The ${flowerType.trim()} you grew today is a gentle reminder that steady nurturing creates beautiful change.`
      : " Your garden is a gentle reminder that steady nurturing creates beautiful change.";
    const musicFragment = typeof musicChoice === "string" && musicChoice.trim().length > 0
      ? ` And with ${musicChoice.trim()} alongside you, your calm is becoming something you can return to anytime.`
      : "";
    const authFragment = isAuthenticated
      ? " Thank you for being here—your presence matters."
      : " You’re welcome here—no account needed to deserve softness and peace.";

    const message = `You showed up for yourself today.${descriptionFragment}${flowerFragment}${musicFragment}${authFragment} 🌸`;

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({
      message: "Like the flowers in your garden, you too are growing into something beautiful every single day. 🌷"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
