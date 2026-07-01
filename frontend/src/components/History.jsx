import React from 'react';
import { Calendar, Trash2, ArrowUpRight, Copy, Check, Info } from 'lucide-react';

export default function History({
  history,
  loadCardFromHistory,
  deleteCardFromHistory,
  clearAllHistory,
  copyCardFromHistory,
  copiedCardId
}) {
  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 min-h-[350px] shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-2xs mb-3">
          <Calendar className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">No Cut History Yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">Your processed debate cards will be saved here locally for fast retrieval.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-800">Cut History ({history.length})</h2>
          <p className="text-xs text-slate-400 mt-0.5">Stored locally in your browser cache.</p>
        </div>
        <button 
          onClick={clearAllHistory}
          className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          Clear All History
        </button>
      </div>

      {/* History Log List */}
      <div className="grid grid-cols-1 gap-4">
        {history.map((card) => (
          <div 
            key={card.id} 
            className="bg-white border border-slate-200 hover:border-indigo-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between md:flex-row md:items-center gap-4 relative group"
          >
            {/* Left Side Details */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase font-mono">
                  {card.colorMode || 'cyan'} highlight
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  {card.timestamp}
                </span>
              </div>

              {/* Tagline */}
              <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                {card.tagline}
              </h3>

              {/* Citation Preview */}
              <p className="text-xs font-mono text-indigo-600 line-clamp-1 bg-indigo-50/30 p-2 rounded-lg border border-indigo-50/50">
                {card.citation}
              </p>

              {/* URL snippet */}
              {card.url && (
                <a 
                  href={card.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] text-slate-400 hover:text-indigo-600 hover:underline flex items-center gap-1 inline-flex w-fit"
                >
                  <span className="truncate max-w-[300px]">{card.url}</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            {/* Right Side Action Buttons */}
            <div className="flex items-center gap-2 self-end md:self-center border-t border-slate-100 pt-3 md:pt-0 md:border-t-0">
              {/* Load Card */}
              <button
                onClick={() => loadCardFromHistory(card)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs hover:shadow-sm"
              >
                <span>Load Card</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {/* Copy Direct */}
              <button
                onClick={() => copyCardFromHistory(card)}
                className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold py-2 px-3 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Copy directly to clipboard"
              >
                {copiedCardId === card.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteCardFromHistory(card.id)}
                className="bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-100 p-2 rounded-lg transition cursor-pointer flex items-center justify-center shadow-2xs"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Hidden element used to format rich text on the fly during direct history copies */}
      <div id="history-rich-copy-buffer" className="hidden" />
    </div>
  );
}
