import React, { useState, useEffect } from 'react';
import Workspace from './components/Workspace.jsx';
import History from './components/History.jsx';
import { Sparkles, History as HistoryIcon } from 'lucide-react';

export default function App() {
  // Navigation State
  const [subTab, setSubTab] = useState('cut'); // 'cut' | 'history'

  // Input & Result State
  const [inputs, setInputs] = useState({
    tagline: '',
    url: '',
    evidence: ''
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
      const response = await fetch('/api/cut-card', {
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
