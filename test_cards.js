import OpenAI from 'openai';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';
dotenv.config({ path: 'backend/.env' });

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const systemPrompt = `You are an elite, professional competitive debate assistant. Your task is to process the provided Evidence block to match the claim in the Tagline.

CRITICAL INSTRUCTIONS:
1. CONDENSE & SHORTEN: Do NOT just output the entire evidence block. Aggressively remove fluff, filler, and irrelevant sentences/paragraphs that do not directly support the tagline. Keep only the core paragraphs. Do NOT rewrite or summarize the remaining text; just delete the unnecessary parts.
2. SHRINKING (The Unread Context): For the text you keep, identify the parts that are just background context or less important. Wrap this unread text in <small> tags.
3. UNDERLINING (The Read Context): Identify the important parts of the remaining evidence that directly support the tagline. Wrap this text in <u> tags.
4. HIGHLIGHTING (The Speech - MOST IMPORTANT): Inside the <u> tags, wrap the critical phrases and words that will actually be read out loud in <mark> tags (e.g., <u><mark>vital words</mark></u>). Highlight enough of the text to convey the full substantive argument—do not highlight too little.
5. THE SPEECH RULE: The highlighted words (<mark>) MUST form a complete, coherent, and grammatically flowing sentence or speech when read back-to-back out loud. Do NOT just highlight random disconnected keywords, percentages, or single words. If someone reads ONLY the highlighted words, it must sound like a natural, persuasive speech that makes sense on its own and proves the tagline.
6. Keep structural integrity. Do not output anything other than the processed HTML card evidence. Do not include markdown formatting or wrapper tags like \`\`\`html or \`\`\` outside the text. Just return the processed text directly.`;

const tests = [
  {
    level: 1,
    tagline: "Universal Basic Income reduces poverty and improves well-being.",
    evidence: "A recent study on the effects of Universal Basic Income (UBI) across several pilot programs has revealed significant findings. While some critics argue that UBI might disincentivize work, the data shows a different story. In municipalities where UBI was introduced, poverty rates dropped by an average of 15% within the first two years. Furthermore, participants reported a 20% increase in overall psychological well-being. They experienced less stress regarding paying rent and buying groceries. The evidence strongly suggests that providing a baseline income floor not only pulls families out of destitution but also allows them to invest in education and better health outcomes."
  },
  {
    level: 2,
    tagline: "Nuclear energy is essential for a rapid transition to zero-carbon grids.",
    evidence: "The debate over climate change solutions often ignores the elephant in the room: baseload power. Wind and solar are excellent and have seen massive cost reductions over the past decade. However, their intermittency poses a severe challenge for grid operators. When the sun doesn't shine and the wind doesn't blow, grids must rely on something else. Historically, this has been coal or natural gas. Nuclear power plants, on the other hand, provide steady, massive amounts of zero-carbon electricity 24/7. According to the International Energy Agency, achieving net-zero by 2050 without a significant expansion of nuclear power would be vastly more difficult and expensive. It requires less land than renewables and has the lowest lifecycle emissions of any energy source. Abandoning nuclear energy in the face of a climate crisis is mathematically incoherent."
  },
  {
    level: 3,
    tagline: "Offensive cyber operations do not deter adversaries, they escalate conflicts.",
    evidence: "In recent years, cyber command strategies have shifted towards 'defend forward' and persistent engagement. The theory is that by taking the fight to the adversary's networks, a nation can establish deterrence and prevent future attacks. However, empirical analysis of state-sponsored cyber interactions between 2010 and 2022 contradicts this premise. When the US engaged in offensive cyber operations against adversaries like Russia and Iran, it did not produce a chilling effect. Instead, it triggered reciprocal escalation. Adversaries perceived these intrusions not as deterrence, but as hostile preparations, prompting them to accelerate their own cyber espionage and destructive capabilities. The data demonstrates that offensive cyber posturing creates a security dilemma, spiraling into a tit-for-tat escalation rather than establishing stable deterrence norms."
  },
  {
    level: 4,
    tagline: "De-dollarization is a myth; the US dollar's hegemony is structurally locked in.",
    evidence: "Headlines frequently proclaim the impending doom of the US dollar as the world's reserve currency, pointing to BRICS initiatives and bilateral trade agreements settled in local currencies. This narrative fundamentally misunderstands global financial plumbing. The dollar's dominance is not merely a product of trade invoicing, but of deep, liquid, and open capital markets that no other nation possesses. China's capital controls make the Renminbi unsuitable for global reserve status, and the Eurozone lacks a unified fiscal structure and sufficient safe assets. Over 88% of global foreign exchange transactions involve the US dollar, and roughly 60% of global central bank reserves are held in dollar-denominated assets. This network effect is self-reinforcing. Even as geopolitical tensions rise, the structural lack of viable alternatives ensures the dollar remains the undisputed bedrock of the international monetary system for the foreseeable future."
  },
  {
    level: 5,
    tagline: "Quantum computing breaks current encryption, necessitating immediate post-quantum cryptography migration.",
    evidence: "The advent of cryptographically relevant quantum computers (CRQCs) represents an existential threat to modern information security. Currently, most secure communications—ranging from banking transactions to classified military communications—rely on public-key cryptography algorithms like RSA and Elliptic Curve. These rely on the mathematical difficulty of factoring large primes or solving discrete logarithms. Shor’s algorithm, running on a sufficiently powerful quantum computer, can solve these problems in polynomial time, effectively instantly breaking the encryption. While estimates suggest a CRQC might be 10 to 15 years away, the threat is immediate due to 'harvest now, decrypt later' strategies. Adversaries are actively intercepting and storing encrypted data today with the intention of decrypting it once quantum capabilities mature. Therefore, waiting for the hardware to exist before migrating to NIST-approved post-quantum cryptographic standards is a recipe for catastrophic systemic failure."
  }
];

async function runTests() {
  let markdown = "# Debate Card Audit Results\n\n";

  for (const test of tests) {
    console.log(`Running test ${test.level}...`);
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tagline: ${test.tagline}\n\nEvidence:\n${test.evidence}` }
      ],
      temperature: 0.1,
      max_tokens: 4096,
    });
    
    let processedHtml = completion.choices[0].message.content;
    if (processedHtml.startsWith('```html')) processedHtml = processedHtml.substring(7);
    else if (processedHtml.startsWith('```')) processedHtml = processedHtml.substring(3);
    if (processedHtml.endsWith('```')) processedHtml = processedHtml.substring(0, processedHtml.length - 3);
    
    markdown += `## Level ${test.level}\n`;
    markdown += `**Tagline:** ${test.tagline}\n\n`;
    markdown += `**Original Evidence Length:** ${test.evidence.length} chars\n\n`;
    markdown += `**AI Output:**\n\n`;
    markdown += `${processedHtml.trim()}\n\n`;
    markdown += `---\n\n`;
  }
  
  writeFileSync('audit_results.md', markdown);
  console.log("Done. Results saved to audit_results.md");
}

runTests().catch(console.error);
