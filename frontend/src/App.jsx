import React, { useState, useEffect } from 'react';
import Workspace from './components/Workspace.jsx';
import History from './components/History.jsx';
import { Sparkles, History as HistoryIcon } from 'lucide-react';

export default function App() {
  // Navigation State
  const [subTab, setSubTab] = useState('cut'); // 'cut' | 'history'

  // Input & Result State
  const [inputs, setInputs] = useState({
    tagline: 'DATA CENTER ELECTRICITY DEMAND IS EXPLODING AND WILL NEARLY TRIPLE BY 2030',
    url: 'https://www.goldmansachs.com/insights/articles/us-data-center-power-demand-projected-to-double-by-2027',
    evidence: `US data center power demand is forecast to more than double to 66 GW in 2027 from 31 GW in 2025, driven by an accelerating buildout of AI infrastructure, according to Goldman Sachs Commodities Research.
Only about 50-60% of data center capacity scheduled for the next one to two years is expected to come online on time amid delays and cancellations.
Regional impacts will diverge sharply, with Mid-Atlantic, Mid-Continent, and Northwest markets facing elevated reliability risks, while the impact in Texas and Georgia may be relatively marginal thanks to plans for additional power generation.
Data centers' share of total US peak summer power demand is projected to jump to 8.5% in 2027 from 4.1% in 2025, creating significant tightening across the national power market.
A wave of new data center construction, fueled by surging demand for artificial intelligence (AI) computing, is on track to more than double the power used by US data centers within two years, according to Goldman Sachs Research.
What is the forecast for data center power demand?
 
US data center power demand is expected to climb from 31 gigawatts (GW) in 2025 to 41 GW in 2026 and 66 GW the year after, write Hongcen Wei, Daan Struyven, and Samantha Dart from the commodities team in Goldman Sachs Research. This demand forecast is based on the estimate that US data center capacity will increase to roughly 95 GW by the end of 2027, more than doubling the level at the end of 2025, and a capacity utilization rate assumption of 70%.
The acceleration is substantial. Year-over-year capacity additions are scheduled to reach 13.6 GW in 2026 and 36.3 GW in 2027, compared with realized additions of 6.4 GW in 2024 and 8.5 GW in 2025, according to Goldman Sachs Research. The forecasts draw on data center development schedules from Aterio. The Aterio data on data center activations uses granular facility-level data covering locations, permitting progress, construction status from official announcements, and satellite imagery.
How much is the data center industry projected to grow?
 
Not all of those ambitious construction schedules will translate into working facilities. Historically, only about 72% of data centers scheduled for activation within the following four quarters actually went online on time. The further out a project is scheduled for activation, the less likely it is to be completed as planned, according to Goldman Sachs Research.
 
Several factors explain the gap between plans and reality. Data center developers frequently submit applications across multiple regions simultaneously, proceeding only with the most favorable site, Wei, Struyven, and Dart write. Supply chain and labor shortages remain the most common causes of delay. And the typical data center takes 18 to 24 months to build once permits are secured.
After adjusting for these risks, Wei, Struyven, and Dart forecast approximately 60% of capacity scheduled for the next year will materialize on time, dropping to roughly 50% in the next two years. Even with those conservative adjustments, the projected additions remain significant: 11.5 GW in the final three quarters of 2026 alone, following 2.2 GW realized in the first quarter.
Which US markets have the biggest increases in power demand?
 
There are sharp regional differences in Goldman Sachs Research’s outlook for power demand. In 2027, the average annual data center additions in each of the Mid-Atlantic, Texas, and Mid-Continent power markets are individually scheduled to exceed the entire nation's total additions in 2025.
But the consequences vary. Power reliability risks are elevated in the Mid-Atlantic, Mid-Continent, and Northwest markets because their planned generation capacity additions are limited relative to the flood of incoming data center demand, the team's analysis shows. These regions may ultimately have to turn some future data centers away.
Texas and Georgia, by contrast, are expected to see only marginal tightening. Both regions have significant new power generation capacity in the pipeline, which should help absorb the additional load. Meanwhile, markets like Tennessee, New England, and Florida are likely to see constrained data center additions since the market is already critically tight.
Where are data centers being built?
 
Power availability and time-to-client are the primary factors driving where data centers choose to locate, Goldman Sachs Research notes.
The share of US data centers in total peak summer power demand is projected to rise from 4.1% in 2025 to 5.3% in 2026 and 8.5% the following year, according to Goldman Sachs Research. That incremental tightening will have consequences for electricity prices and grid stability across the country.
Wei, Struyven, and Dart caution that the outlook carries meaningful uncertainty in both directions. On the downside, delays and cancellations could reduce the amount of activated capacity below current projections. On the upside, new projects not yet in the pipeline could push actual additions even higher than scheduled, particularly in later years. Elevated capital spending could also compress construction timelines to as little as one year, accelerating the buildout beyond historical patterns.
 
This article is being provided for educational purposes only. The information contained in this article does not constitute a recommendation from any Goldman Sachs entity to the recipient, and Goldman Sachs is not providing any financial, economic, legal, investment, accounting, or tax advice through this article or to its recipient. Neither Goldman Sachs nor any of its affiliates makes any representation or warranty, express or implied, as to the accuracy or completeness of the statements or any information contained in this article and any liability therefore (including in respect of direct, indirect, or consequential loss or damage) is expressly disclaimed.`
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [colorMode, setColorMode] = useState('cyan'); // cyan | blue | yellow
  const [copied, setCopied] = useState(false);

  // History State
  const [history, setHistory] = useState([]);
  const [copiedCardId, setCopiedCardId] = useState(null);



  // Load history and API key from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('iClusion_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history from localStorage', e);
      }
    }

  }, []);

  // Save history helper
  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('iClusion_history', JSON.stringify(newHistory));
  };



  // Execute Card Cut Trigger
  const executeCardCut = async () => {
    if (!inputs.tagline || !inputs.evidence) {
      alert('Please fill out Tagline and Evidence block.');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/cut-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagline: inputs.tagline,
          url: inputs.url,
          evidence: inputs.evidence
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data);
        
        // Save to history
        const newCard = {
          id: Date.now().toString(),
          tagline: inputs.tagline,
          url: inputs.url,
          evidence: inputs.evidence,
          citation: data.citation,
          citationHeader: data.citationHeader,
          citationSub: data.citationSub,
          htmlCard: data.htmlCard,
          colorMode: colorMode,
          timestamp: new Date().toLocaleString()
        };
        saveHistory([newCard, ...history]);
      } else {
        alert(data.error || 'Failed to process card. Check API configuration.');
      }
    } catch (err) {
      console.error('Connection failed:', err);
      alert('Failed connecting to backend cutting terminal. Ensure npm run start is active on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const clearInputs = () => {
    setInputs({ tagline: '', url: '', evidence: '' });
    setResult(null);
  };

  // History Actions
  const loadCardFromHistory = (card) => {
    setInputs({
      tagline: card.tagline,
      url: card.url,
      evidence: card.evidence
    });
    setResult({
      citation: card.citation,
      citationHeader: card.citationHeader,
      citationSub: card.citationSub,
      htmlCard: card.htmlCard
    });
    if (card.colorMode) {
      setColorMode(card.colorMode);
    }
    setSubTab('cut');
  };

  const deleteCardFromHistory = (id) => {
    const updated = history.filter(c => c.id !== id);
    saveHistory(updated);
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear your local history log?')) {
      saveHistory([]);
    }
  };

  // Helper to compile MS Word compatible Rich Text Copy
  const copyFormattedContent = (tagline, citationHeader, citationSub, htmlCard, url, activeColor) => {
    // Generate inline style mapping
    let highlightBg = '#00ffff'; // Cyan
    if (activeColor === 'blue') highlightBg = '#38bdf8';
    else if (activeColor === 'yellow') highlightBg = '#fbbf24';

    // 1. Build Tagline Block (All-caps, bold, large, sans-serif, black)
    const taglineHtml = `<div style="font-family: Arial, sans-serif; font-size: 13pt; font-weight: bold; color: #000000; text-transform: uppercase; margin-bottom: 4px;">${tagline}</div>`;

    // 2. Build Citation Header Block (Bold, medium, sans-serif, black)
    const citationHeaderHtml = `<div style="font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; color: #000000; margin-bottom: 2px;">${citationHeader}</div>`;
    
    // 3. Build URL and Access Block (blue, underlined, small, sans-serif)
    const urlHtml = citationSub
      ? `<div style="font-family: Arial, sans-serif; font-size: 9.5pt; color: #0284c7; margin-bottom: 12px;"><a href="${url}" style="color: #0284c7; text-decoration: underline;">${citationSub}</a></div>`
      : '';

    // 4. Process Evidence Text to inject MS Word friendly inline styles on <u> and <mark>
    let processedHtml = htmlCard;

    // Apply inline style to u tags
    processedHtml = processedHtml.replace(
      /<u>/gi, 
      '<u style="text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 3px; font-weight: bold; color: #0f172a;">'
    );

    // Apply inline style to mark tags (which sit inside u tags)
    processedHtml = processedHtml.replace(
      /<mark>/gi, 
      `<mark style="background-color: ${highlightBg} !important; color: #000000 !important; font-weight: bold; text-decoration: underline;">`
    );

    // 5. Wrap everything in a Times New Roman / Georgia body where normal text has reduced font-size and color
    const styledBody = `
      <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 10.5pt; color: #64748b; line-height: 1.6; text-align: justify;">
        ${taglineHtml}
        ${citationHeaderHtml}
        ${urlHtml}
        <div style="margin-top: 10px;">${processedHtml}</div>
      </div>
    `;

    // Strip HTML for plain text clipboard item
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = taglineHtml + '\n' + citationHeaderHtml + '\n' + (citationSub ? citationSub + '\n' : '') + '\n' + htmlCard;
    const plainText = tempDiv.innerText;

    // Write to clipboard using standard ClipboardItem blobs
    const blobHtml = new Blob([styledBody], { type: 'text/html' });
    const blobText = new Blob([plainText], { type: 'text/plain' });

    return new ClipboardItem({
      'text/html': blobHtml,
      'text/plain': blobText
    });
  };

  const copyRichToClipboard = () => {
    if (!result) return;
    try {
      const header = result.citationHeader || (result.citation ? result.citation.split('\n')[0] : '');
      const sub = result.citationSub || (result.citation ? result.citation.split('\n')[1] : '');
      const item = copyFormattedContent(inputs.tagline, header, sub, result.htmlCard, inputs.url, colorMode);
      navigator.clipboard.write([item]).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Rich copy failed, running fallback copy...', err);
      // Fallback
      const range = document.createRange();
      const el = document.getElementById('rich-card-content');
      if (el) {
        range.selectNode(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const copyCardFromHistory = (card) => {
    try {
      const header = card.citationHeader || (card.citation ? card.citation.split('\n')[0] : '');
      const sub = card.citationSub || (card.citation ? card.citation.split('\n')[1] : '');
      const item = copyFormattedContent(card.tagline, header, sub, card.htmlCard, card.url, card.colorMode || 'cyan');
      navigator.clipboard.write([item]).then(() => {
        setCopiedCardId(card.id);
        setTimeout(() => setCopiedCardId(null), 1500);
      });
    } catch (err) {
      alert('Copy engine failed.');
    }
  };



  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
      {/* 1. Portal Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg shadow-sm shadow-indigo-600/20">
              í
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
              iClusion
            </h1>
          </div>

          {/* Active Page Label */}
          <div className="hidden md:flex items-center">
            <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-indigo-600">Card Cutter</span>
          </div>
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-2">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3.5 rounded-lg transition cursor-pointer">
            Account
          </button>
          <button className="text-slate-500 hover:text-slate-700 text-xs font-medium py-2 px-2 rounded-lg transition cursor-pointer">
            Sign Out
          </button>
        </div>
      </header>

      {/* 2. Sub-Tabs Bar under Card Cutter */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 flex gap-2">
        <button 
          onClick={() => setSubTab('cut')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === 'cut' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cut</span>
        </button>
        
        <button 
          onClick={() => setSubTab('history')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === 'history' 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <HistoryIcon className="w-3.5 h-3.5" />
          <span>History</span>
        </button>
      </div>

      {/* 3. Main Split View Workspace */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-6">
        {subTab === 'cut' ? (
          <Workspace 
            inputs={inputs}
            setInputs={setInputs}
            result={result}
            loading={loading}
            executeCardCut={executeCardCut}
            clearInputs={clearInputs}
            colorMode={colorMode}
            setColorMode={setColorMode}
            copied={copied}
            copyRichToClipboard={copyRichToClipboard}
          />
        ) : (
          <History 
            history={history}
            loadCardFromHistory={loadCardFromHistory}
            deleteCardFromHistory={deleteCardFromHistory}
            clearAllHistory={clearAllHistory}
            copyCardFromHistory={copyCardFromHistory}
            copiedCardId={copiedCardId}
          />
        )}
      </main>


      
      {/* Footer console profile */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 flex justify-between items-center text-[10px] text-slate-400 font-medium">
        <div>Engine Profile: Llama-3.1-NVIDIA-NIM</div>
        <div>System Workspace: iClusion cutting-v1.0.0</div>
      </footer>
    </div>
  );
}
