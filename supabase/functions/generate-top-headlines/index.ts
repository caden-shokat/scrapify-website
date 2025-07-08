import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({
        error: 'No headlines provided'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({
        error: 'OpenAI key not configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const generated = [];
    for (const hl of items){
      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4.1',
            messages: [
              {
                role: 'system',
                content: `
                **This content is for contextual purposes ONLY and should NOT appear in ad copy.**

                # Example AI Copywritten Headlines:

                - Original: Americans Are Freaking Out Over This All-New Hyundai Tucson (Take a Look)
                - AI: Americans Are Rushing to Try This All-New Hearing Aid (Take a Look)

                - Original: "I'm 60 With $1.2 Million in an IRA. Should I Convert $120K/Year to a Roth to Avoid RMDs?"	
                - AI: 	"I'm 60 and Overwhelmed by Hearing Aid Choices. Help!"

                - Original: Americans Are Freaking Out Over This All-New Hyundai Tucson (Take a Look)
                - AI: Americans Over 55 Are Raving About This New 2025 Hearing Aid

                - Original: Experts Reveal Why 55+ in Rhode Island These Beach Chairs
                - AI: Experts Reveal Why 55+ in Rhode Island Love Hearing Aids

                - Original: Urologist: Amazon's Worst Nightmare: Thousands Canceling Prime for This Clever Hack
                - AI: Audiologists' Worst Nightmare: Thousands Ditching Old Aids For This Hack

                - Original: Don't Clean Out Your Gutters, Do This Instead
                - AI: Don't Ignore Your Hearing—Try This Instead

                - Original: 7 Wealth Tips Once Your Portfolio Reaches $1 Million
                - AI: 7 Hearing Health Tips Once You Hit 55

                - Original: New York: Metal Roof Options Now Open in These Zip Codes
                - AI: New York: Hearing Aid Clinics Quietly Expanding in These Zip Codes

                # Hear.com Advertising Reference

                ## Key Value Propositions
                - **Advanced German-Engineered Technology**  
                  - Bluetooth connectivity, rechargeable batteries, noise-reduction  
                  - Smartphone integration for discreet, on-the-go control  
                - **Expert-Led Care**  
                  - Hand-picked top 2% audiologists & hearing specialists  
                  - Personalized assessments & ongoing adjustments  
                - **Tailored Solutions**  
                  - In-the-ear to behind-the-ear styles  
                  - Recommendations based on lifestyle, hearing-loss profile, comfort  
                - **Risk-Free Trial & Warranty**  
                  - 45-day real-world trial  
                  - Full refund or alternative solution if not satisfied  
                  - Comprehensive warranty coverage  

                ## Customer Experience Highlights
                - **Streamlined Process**: free consultation → thorough test → expert guidance  
                - **“Never Corporate” Culture**: owner-mindset teams focused on individual well-being  
                - **Long-Term Support**: regular check-ins, fine-tuning, confidence-building

                ## Brand Tone & Hooks
                - Emphasize **“Audiologist-approved”** or **“Hearing Specialist”** expertise  
                - Highlight **“45-day trial”**, **“risk-free”**, and **“proven outcomes”**  
                - Use **listicles**, **curiosity**, and **social proof** (“Over 1 Million helped”)  
                - Reference the **current year** (e.g. “Why act in 2025”) for urgency

                ---
                `
              },
              {
                role: 'user',
                content: `
                You are a native-ad copywriting expert for hear.com. The goal is to write click baity headlines for the Taboola Network that drive interest of people for our lead generation campaigns. 
                Given the "original" headline, please rewrite the headline for a hearing aid lead generation campaign, but stay very close to the original headline concept:

                Original: ${hl.headline}
                
                1. Always mention hearing aid or hearing aids.
                2. Speak to a 55+ U.S. audience—do not use “senior” or “senior citizens.”  
                3. Use Taboola Network native ad style for a hear.com campaign.  
                4. Length ≤ 60 characters (including spaces).  
                5. Avoid these forbidden terms: “hear.com," "aid" as a single word without the word hearing, price/cost related terms.
                6. Do not copy original units (gallons, miles, beds, pounds, scores etc.). If you need a unit, translate it to hearing metrics (e.g. “17 audiologists tested,” “30% clarity boost,” “5 signs,” “in 30 days”).  
                7. You may use “2025,” mention “audiologists” or “experts,” “#1” or other stats, and “U.S.”  
                8. Flow naturally as a native ad headline.

                Return **only** the rewritten headline.
                `.trim()
              }
            ],
            max_tokens: 300,
            temperature: 0.8
          })
        });
        if (!resp.ok) {
          console.error('OpenAI error for', hl.source_id, await resp.text());
          continue;
        }
        const { choices } = await resp.json();
        let ai = choices[0].message.content.trim().replace(/^\d+\.\s*/, '').replace(/^"|"$/g, '').trim();

        const newId = crypto.randomUUID();
        const { data: up, error: upErr } = await supabaseClient.from('top_ai_headlines').upsert({
          source_id: hl.source_id,
          week: hl.week,
          year: hl.year,
          headline: hl.headline,
          frequency: hl.frequency,
          ai_headline: ai,
          id: newId
        }, {
          onConflict: [
            'source_id',
            'week',
            'year'
          ]
        });
        if (upErr) {
          console.error('Upsert error', upErr);
        } else {
          generated.push({
            source_id: hl.source_id,
            ai_headline: ai
          });
        }
        await supabaseClient.from('allAI').insert({
          id: newId,
          headline: hl.headline,
          ai_headline: ai
        });
      } catch (e) {
        console.error('Generation error for', hl.source_id, e);
      }
    }
    return new Response(JSON.stringify({
      success: true,
      count: generated.length,
      results: generated
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Fatal error in function:', err);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
