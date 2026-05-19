import React, { useState } from 'react';
import { Sparkles, Copy, Check, Terminal, Image, AlertCircle, ShieldCheck } from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;


function App() {
  const [rawIdea, setRawIdea] = useState('');
  const [targetAI, setTargetAI] = useState('ChatGPT/Claude');
  const [tone, setTone] = useState('Professional & Detailed (Enterprise Standard)');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!rawIdea.trim()) return;

    setLoading(true);
    setGeneratedPrompt('');

    try {
      const systemPrompt = `You are a world-class Prompt Engineer. 
      Transform this raw, poorly written idea into a highly effective, optimized master prompt for ${targetAI}.
      Apply the following tone/style constraints: ${tone}.
      
      Structure the output professionally with headers like:
      - 🎯 ROLE & CONTEXT
      - 📝 OBJECTIVE / TASK
      - ⚠️ CONSTRAINTS & RULES
      - 📋 OUTPUT FORMAT
      
      Provide ONLY the final engineered prompt. No conversational filler or meta-text.
      Raw Idea: "${rawIdea}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'API Error: ' + response.status);
      }

      const data = await response.json();

      if (
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0]
      ) {
        setGeneratedPrompt(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Invalid response format from Gemini');
      }

    } catch (error) {
      console.error(error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">

      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Promptara
            </h1>
            <p className="text-xs text-slate-500">Transform Your Ideas Into Perfect AI Prompts</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Gemini Active</span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Left Panel */}
        <section className="md:col-span-5 flex flex-col gap-6 bg-slate-800 border border-slate-700/60 p-6 rounded-2xl shadow-xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Configuration Panel</h2>
            <p className="text-xs text-slate-400">Specify parameters for the prompt engine</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Target Model Architecture
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetAI('ChatGPT/Claude')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  targetAI === 'ChatGPT/Claude'
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Terminal className="h-4 w-4" /> Large Language (Text)
              </button>
              <button
                type="button"
                onClick={() => setTargetAI('Midjourney/DALL-E')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  targetAI === 'Midjourney/DALL-E'
                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Image className="h-4 w-4" /> Diffusion (Images)
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Optimization Strategy / Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-100 cursor-pointer"
            >
              <option value="Professional & Detailed (Enterprise Standard)">Professional & Detailed (Enterprise Standard)</option>
              <option value="Creative & Conceptual (Out of the Box)">Creative & Conceptual (Out of the Box)</option>
              <option value="Strict & Computational (For Coding/Logic)">Strict & Computational (For Coding/Logic)</option>
              <option value="Academic & Scientific (Research Heavy)">Academic & Scientific (Research Heavy)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 flex-grow">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Raw Input
            </label>
            <textarea
              value={rawIdea}
              onChange={(e) => setRawIdea(e.target.value)}
              placeholder="Apna raw idea likhein — e.g. 'write a cold email for SaaS founders'"
              className="w-full flex-grow p-4 bg-slate-900/60 border border-slate-700/80 rounded-xl resize-none focus:outline-none focus:border-indigo-500 transition-all text-sm leading-relaxed text-slate-200 placeholder-slate-600 min-h-[180px]"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !rawIdea.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                <span>Compiling Instructions...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Optimize System Prompt</span>
              </>
            )}
          </button>
        </section>

        {/* Right Panel (Output Display Container) */}
        <section className="md:col-span-7 flex flex-col bg-slate-800/40 border border-slate-700/40 rounded-2xl overflow-hidden backdrop-blur-sm min-h-[400px]">
          <div className="px-6 py-4 border-b border-slate-700/40 bg-slate-800/60 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Terminal className="h-4 w-4 text-indigo-400" />
              <span>Optimized Output</span>
            </div>
            {generatedPrompt && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="p-6 flex-grow flex flex-col overflow-y-auto max-h-[500px]">
            {generatedPrompt ? (
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex-grow">
                {generatedPrompt}
              </pre>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <AlertCircle className="h-8 w-8 mb-3 stroke-[1.5]" />
                <p className="text-sm">Configure your settings and add a raw idea to generate a master prompt.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/40 py-6 text-center text-xs text-slate-600 mt-auto">
        <p>&copy; 2026 Promptara. Powered by Gemini Flash.</p>
      </footer>
    </div>
  );
}

export default App;
