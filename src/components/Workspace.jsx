import React, { useRef } from 'react';
import { Sparkles, Trash2, Copy, Check, ExternalLink, Moon, Sun, Key } from 'lucide-react';

export default function Workspace({
  inputs,
  setInputs,
  result,
  loading,
  executeCardCut,
  clearInputs,
  colorMode,
  setColorMode,
  copied,
  copyRichToClipboard
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left Input Configuration (5 Columns) */}
      <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs transition hover:shadow-md">
        <div>
          <div className="mb-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Card Configuration</h2>
          </div>

          <div className="space-y-4">
            {/* Tagline Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Tagline</label>
              </div>
              <input 
                type="text"
                name="tagline" 
                value={inputs.tagline} 
                onChange={handleInputChange}
                placeholder="State the core argument claim clearly..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition placeholder-slate-400 font-sans"
              />
            </div>

            {/* Source URL Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Source URL</label>
              </div>
              <input 
                type="text"
                name="url" 
                value={inputs.url} 
                onChange={handleInputChange}
                placeholder="https://example.com/article"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition placeholder-slate-400 font-sans"
              />
            </div>

            {/* Raw Evidence Textarea */}
            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Evidence</label>
              </div>
              <textarea 
                name="evidence" 
                value={inputs.evidence} 
                onChange={handleInputChange}
                placeholder="Paste your evidence text here..."
                className="w-full min-h-[260px] lg:min-h-[300px] border border-slate-200 rounded-lg p-3.5 text-sm font-mono focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition resize-none leading-relaxed placeholder-slate-400 bg-slate-50/30"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button 
            onClick={executeCardCut} 
            disabled={loading || !inputs.tagline || !inputs.evidence}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none text-white font-semibold py-3 px-4 rounded-lg transition-all text-sm shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer border border-indigo-600 hover:border-indigo-700"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-slate-400 border-t-indigo-600 rounded-full animate-spin" />
                <span>Cutting Card...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Queue Card Cut</span>
              </>
            )}
          </button>

          <button 
            onClick={clearInputs}
            className="border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 p-3 rounded-lg transition shadow-2xs cursor-pointer flex items-center justify-center"
            title="Clear Inputs"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </section>

      {/* Right Output Panel (7 Columns) */}
      <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden transition hover:shadow-md">
        {/* Output Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-800">Highlighted Card</span>
          {result && (
            <div className="flex items-center gap-4">
              {/* Highlight Theme Injector */}
              <div className="flex gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                {['cyan', 'blue', 'yellow'].map((color) => (
                  <button 
                    key={color} 
                    onClick={() => setColorMode(color)}
                    className={`w-5 h-5 rounded-md border transition cursor-pointer hover:scale-105 active:scale-95 ${
                      color === 'cyan' ? 'bg-cyan-400' : color === 'blue' ? 'bg-sky-400' : 'bg-amber-400'
                    } ${
                      colorMode === color ? 'border-slate-800 ring-2 ring-slate-800/10 scale-105' : 'border-transparent'
                    }`}
                    title={`${color.charAt(0).toUpperCase() + color.slice(1)} highlights`}
                  />
                ))}
              </div>

              {/* Copy Button */}
              <button 
                onClick={copyRichToClipboard} 
                className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold py-1.5 px-3 rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy with Formatting</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Output Document View */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[400px]">
          {result ? (
            <div 
              id="rich-card-content" 
              className={`card-render-engine ${colorMode} select-text bg-white`}
            >
              {/* Tagline (rendered inside the card content) */}
              <h3 className="text-xl font-bold uppercase tracking-tight text-black mb-1 select-all font-sans leading-tight">
                {inputs.tagline}
              </h3>

              {/* Citation Header (e.g. Goldman 26’) */}
              <div className="text-base font-bold text-black select-all font-sans">
                {result.citationHeader || (result.citation ? result.citation.split('\n')[0] : '')}
              </div>

              {/* Clickable Source URL & Access Date */}
              {(result.citationSub || (result.citation && result.citation.includes('\n'))) && (
                <div className="mb-4 text-xs font-sans text-sky-600 font-medium select-all mt-1 flex items-center flex-wrap gap-1">
                  <a 
                    href={inputs.url || (result.metaData && result.metaData.url)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="underline hover:text-sky-800 break-all"
                  >
                    {result.citationSub ? result.citationSub.split(' accessed ')[0] : (result.citation.split('\n')[1] ? result.citation.split('\n')[1].split(' accessed ')[0] : '')}
                  </a>
                  <span className="text-slate-500 font-normal">
                    accessed {result.citationSub ? result.citationSub.split(' accessed ')[1] : (result.citation.split('\n')[1] ? result.citation.split('\n')[1].split(' accessed ')[1] : '')}
                  </span>
                </div>
              )}

              {/* Processed Evidence HTML */}
              <div 
                className="card-evidence-body text-slate-700 leading-relaxed font-sans mt-3 text-justify select-text"
                dangerouslySetInnerHTML={{ __html: result.htmlCard }}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-16">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-2xs">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Ready to Process</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">Enter your tagline and raw evidence, then queue a Card Cutter job.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
