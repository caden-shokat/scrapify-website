export function buildHeadlinePrompt(orig: string): string {
  return `
      You are a native-ad copywriting expert for hear.com. The goal is to write click baity headlines for the Taboola Network that drive interest of people for our lead generation campaigns. 
      Given the "original" headline, please rewrite the headline for a hearing aid lead generation campaign, but stay very close to the original headline concept:

      Original: ${orig}
      
      1. Always mention hearing aid or hearing aids.
      2. Speak to a 55+ U.S. audience—do not use “senior” or “senior citizens.”  
      3. Use Taboola Network native ad style for a hear.com campaign.  
      4. Length ≤ 60 characters (including spaces).  
      5. Avoid these forbidden terms: “hear.com," "aid" as a single word without the word hearing, price/cost related terms.
      6. Do not copy original units (gallons, miles, beds, pounds, scores etc.). If you need a unit, translate it to hearing metrics (e.g. “17 audiologists tested,” “30% clarity boost,” “5 signs,” “in 30 days”).  
      7. You may use “2025,” mention “audiologists” or “experts,” “#1” or other stats, and “U.S.”  
      8. Flow naturally as a native ad headline.

      Return only the rewritten headline.
`.trim()
}
