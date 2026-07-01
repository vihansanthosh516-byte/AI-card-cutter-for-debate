import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to extract metadata from a URL
async function scrapeUrlMetadata(targetUrl) {
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(response.data);

    // 1. Title Extraction
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      $('h1').first().text().trim() ||
      'Untitled Source';

    // 2. Author Extraction
    let author = 
      $('meta[name="author"]').attr('content') ||
      $('meta[property="article:author"]').attr('content') ||
      $('meta[name="twitter:creator"]').attr('content') ||
      $('.author').first().text().trim() ||
      $('[rel="author"]').first().text().trim() ||
      '';

    // Clean up author if it contains newlines or excessive spaces
    author = author.replace(/\s+/g, ' ').trim();
    // Strip trailing/leading non-word characters if any
    if (author.toLowerCase().startsWith('by ')) {
      author = author.substring(3);
    }

    // 3. Publisher / Site Name Extraction
    const publisher = 
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[name="publisher"]').attr('content') ||
      $('meta[name="twitter:site"]').attr('content') ||
      '';

    // 4. Date Extraction
    let dateStr = 
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[property="og:article:published_time"]').attr('content') ||
      $('meta[name="pubdate"]').attr('content') ||
      $('meta[name="publishdate"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('time').attr('datetime') ||
      '';

    let formattedDate = '';
    if (dateStr) {
      try {
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          // Format as M-D-YYYY
          formattedDate = `${dateObj.getMonth() + 1}-${dateObj.getDate()}-${dateObj.getFullYear()}`;
        }
      } catch (e) {
        // Leave empty if date parsing fails
      }
    }

    return {
      title: title.replace(/\s+/g, ' ').trim(),
      author: author,
      publisher: publisher.replace(/\s+/g, ' ').trim(),
      date: formattedDate,
      url: targetUrl
    };
  } catch (error) {
    console.error(`Metadata scraping failed for ${targetUrl}:`, error.message);
    
    // Graceful fallback to Domain Name extraction
    let domain = 'Unknown Source';
    try {
      domain = new URL(targetUrl).hostname;
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }
    } catch (e) {
      if (targetUrl) domain = targetUrl;
    }

    return {
      title: domain,
      author: '',
      publisher: domain,
      date: '',
      url: targetUrl
    };
  }
}

// Log API key status at startup
const envKey = process.env.GROQ_API_KEY;
console.log(`[STARTUP] GROQ_API_KEY loaded: ${envKey ? 'YES (' + envKey.substring(0, 12) + '...)' : 'NO - MISSING!'}`);

app.post('/api/cut-card', async (req, res) => {
  const { tagline, url, evidence } = req.body;

  if (!tagline || !evidence) {
    return res.status(400).json({ error: 'Missing tagline or evidence text.' });
  }

  // Use API key from environment
  const apiKey = process.env.GROQ_API_KEY;
  console.log(`[CUT-CARD] API key available: ${apiKey ? 'YES' : 'NO'}`);

  if (!apiKey) {
    return res.status(401).json({ error: 'Groq API key not provided or configured. Please supply a valid key.' });
  }

  // Initialize client per-request to allow dynamic API key updates
  const groqClient = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  });

  // Strict System Prompt to enforce debate card formatting, condensing, and speech rules
  const systemPrompt = `You are an elite, professional competitive debate assistant. Your task is to process the provided Evidence block to match the claim in the Tagline.

CRITICAL INSTRUCTIONS:
1. CONDENSE & SHORTEN: Do NOT just output the entire evidence block. Aggressively remove fluff, filler, and irrelevant sentences/paragraphs that do not directly support the tagline. Keep only the core paragraphs. Do NOT rewrite or summarize the remaining text; just delete the unnecessary parts.
2. SHRINKING (The Unread Context): For the text you keep, identify the parts that are just background context or less important. Wrap this unread text in <small> tags.
3. UNDERLINING (The Read Context): Identify the important parts of the remaining evidence that directly support the tagline. Wrap this text in <u> tags.
4. HIGHLIGHTING (The Speech - MOST IMPORTANT): Inside the <u> tags, wrap the critical phrases and words that will actually be read out loud in <mark> tags (e.g., <u><mark>vital words</mark></u>). Highlight enough of the text to convey the full substantive argument—do not highlight too little.
5. THE SPEECH RULE: The highlighted words (<mark>) MUST form a complete, coherent, and grammatically flowing sentence or speech when read back-to-back out loud. Do NOT just highlight random disconnected keywords, percentages, or single words. If someone reads ONLY the highlighted words, it must sound like a natural, persuasive speech that makes sense on its own and proves the tagline.
6. Keep structural integrity. Do not output anything other than the processed HTML card evidence. Do not include markdown formatting or wrapper tags like \`\`\`html or \`\`\` outside the text. Just return the processed text directly.`;

  const startTime = Date.now();
  console.log(`[CUT-CARD] Received request. Tagline: "${tagline}", Evidence length: ${evidence.length} chars, URL: "${url || 'none'}"`);

  try {
    // 1. Generate the citation block (concurrently or sequentially)
    let meta = { title: '', author: '', publisher: '', date: '', url: url || '' };
    if (url) {
      console.log(`[CUT-CARD] Scraping metadata for URL: ${url}`);
      meta = await scrapeUrlMetadata(url);
      console.log(`[CUT-CARD] Scraped metadata:`, meta);
    }

    // Get current date for access log
    const accessDate = new Date();
    const accessDateStr = `${accessDate.getMonth() + 1}-${accessDate.getDate()}-${accessDate.getFullYear()}`;

    // Compile Debate Citation in the style of the screenshot:
    // Header format: Author/Publisher YY’ (e.g. Goldman 26’)
    let authorPart = 'Unknown';
    if (meta.author && meta.author.trim().length > 0) {
      const authorLower = meta.author.toLowerCase();
      if (authorLower.includes('goldman')) {
        authorPart = 'Goldman';
      } else if (meta.author.includes(',')) {
        authorPart = meta.author.split(',')[0].trim();
      } else {
        const parts = meta.author.trim().split(/\s+/);
        authorPart = parts[parts.length - 1];
      }
    } else if (meta.publisher && meta.publisher.trim().length > 0) {
      const pubLower = meta.publisher.toLowerCase();
      if (pubLower.includes('goldman')) {
        authorPart = 'Goldman';
      } else {
        authorPart = meta.publisher.trim().split(/\s+/)[0];
      }
    } else if (url) {
      try {
        const hostname = new URL(url).hostname.replace('www.', '');
        const parts = hostname.split('.');
        authorPart = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        if (authorPart.toLowerCase().includes('goldman')) {
          authorPart = 'Goldman';
        }
      } catch (e) {
        authorPart = 'Source';
      }
    }

    let yearPart = '26'; // Default to current short year format
    if (meta.date) {
      try {
        const match = meta.date.match(/\d{4}/);
        if (match) {
          yearPart = match[0].slice(-2);
        } else {
          const parts = meta.date.split('-');
          for (const p of parts) {
            if (p.length === 4) {
              yearPart = p.slice(-2);
              break;
            }
          }
        }
      } catch (e) {}
    }

    const citationHeader = `${authorPart} ${yearPart}’`;
    const citationSub = `${url || 'No URL Input'} accessed ${accessDateStr}`;
    const legacyCitation = `${citationHeader}\n${citationSub}`;

    // 2. Query the LLM for card cutting
    console.log(`[CUT-CARD] Sending request to Groq Llama 3.3 70B...`);
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tagline: ${tagline}\n\nEvidence:\n${evidence}` }
      ],
      temperature: 0.1, // Low temp guarantees strict adherence to input text
      max_tokens: 4096,
    });

    console.log(`[CUT-CARD] Received response from Groq in ${Date.now() - startTime}ms`);
    let processedHtml = completion.choices[0].message.content;

    // Clean up any code blocks the LLM might have wrapped the response in
    if (processedHtml.startsWith('```html')) {
      processedHtml = processedHtml.substring(7);
    } else if (processedHtml.startsWith('```')) {
      processedHtml = processedHtml.substring(3);
    }
    if (processedHtml.endsWith('```')) {
      processedHtml = processedHtml.substring(0, processedHtml.length - 3);
    }
    processedHtml = processedHtml.trim();

    console.log(`[CUT-CARD] Request successfully completed!`);
    res.json({
      success: true,
      citationHeader: citationHeader,
      citationSub: citationSub,
      citation: legacyCitation,
      htmlCard: processedHtml,
      metaData: meta
    });

  } catch (error) {
    console.error('[CUT-CARD] Groq API Error:', error);
    res.status(500).json({ error: error.message || 'Processing engine failure.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend cutting engine active on port ${PORT}`));
