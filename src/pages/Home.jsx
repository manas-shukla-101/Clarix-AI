import { useNavigate } from 'react-router-dom'

const features = [
  {
    icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>),
    title: 'Universal File Support',
    desc: 'Upload CSV, JSON, Excel files or paste a Google Sheets link. Zero data sent to servers.',
    gradient: 'from-blue-500 to-cyan-500',
    glow: 'shadow-blue-500/20',
  },
  {
    icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>),
    title: 'AI-Powered Chart Suggestions',
    desc: 'Our AI reads your data structure and recommends the most insightful charts automatically.',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>),
    title: 'Drag & Drop Dashboard',
    desc: 'Freely arrange and resize your charts on an intelligent, collision-aware grid canvas.',
    gradient: 'from-indigo-500 to-blue-600',
    glow: 'shadow-indigo-500/20',
  },
  {
    icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>),
    title: 'Instant Shareable Link',
    desc: 'Generate a permanent URL to share your full interactive dashboard with anyone.',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/20',
  },
  {
    icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>),
    title: 'Export as PDF & PNG',
    desc: 'Download your entire dashboard as a high-resolution image or a print-ready PDF document.',
    gradient: 'from-rose-500 to-pink-600',
    glow: 'shadow-rose-500/20',
  },
  {
    icon: (<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
    title: '100% Private & Local',
    desc: 'All processing happens inside your browser. No accounts, no uploads, no tracking—ever.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20',
  },
]

const stats = [
  { value: '6+', label: 'Chart Types' },
  { value: '100%', label: 'Browser-Based' },
  { value: '< 2s', label: 'Time to Chart' },
  { value: 'Free', label: 'Forever' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="w-full relative overflow-x-hidden bg-zinc-50 dark:bg-zinc-950">

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(40px,-60px) scale(1.12); }
          66% { transform: translate(-25px,25px) scale(0.9); }
        }
        .animate-blob { animation: blob 9s infinite ease-in-out; }
        .delay-2 { animation-delay: 2s; }
        .delay-4 { animation-delay: 4s; }
        @keyframes float-y {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        .animate-float { animation: float-y 5s ease-in-out infinite; }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg,#6366f1,#a78bfa,#818cf8,#6366f1);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }
        .dot-grid {
          background-image: radial-gradient(circle, rgba(99,102,241,0.13) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}} />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-4 py-32 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-60 dark:opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-25 dark:opacity-15 animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-10 animate-blob delay-2" />
          <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-20 dark:opacity-10 animate-blob delay-4" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          {/* Live badge */}
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur text-indigo-700 dark:text-indigo-300 text-sm font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            No signup. No servers. No cost.
          </div>

          {/* Floating logo */}
          <div className="mb-10 animate-float">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 blur-2xl opacity-40 scale-110" />
              <div className="relative p-3 rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/50 dark:border-zinc-700/50 shadow-2xl shadow-indigo-500/20">
                <img src="/logo.png" alt="Clarix Logo" className="w-20 h-20 object-contain rounded-2xl" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none">
            <span className="text-zinc-900 dark:text-white">Your data,</span>
            <br />
            <span className="shimmer-text">visualized.</span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mb-12 max-w-2xl leading-relaxed font-medium">
            Transform raw CSV, Excel, or JSON into stunning, interactive dashboards — entirely in your browser in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              id="hero-cta-upload"
              onClick={() => navigate('/upload')}
              className="group relative px-9 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2.5">
                Upload Your Data
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </span>
            </button>
            <button
              id="hero-cta-sample"
              onClick={() => navigate('/upload')}
              className="px-9 py-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur font-bold text-lg text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:-translate-y-1 transition-all duration-300"
            >
              Try with sample data →
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BANNER ────────────────────────────────────────────────── */}
      <section className="relative z-10 w-full py-14 border-y border-zinc-100 dark:border-zinc-900 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center group cursor-default">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                {s.value}
              </div>
              <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────────────────────────── */}
      <section className="relative w-full py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-3">Everything You Need</p>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white">Packed with powerful features</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg mt-4 max-w-xl mx-auto">Every tool you need to turn raw numbers into beautiful, shareable stories.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-7 rounded-3xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center rounded-2xl mb-5 shadow-lg ${f.glow} group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="relative w-full py-32 px-4 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-3">Workflow</p>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white">From file to dashboard in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01', title: 'Upload', color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/30',
                desc: 'Drop your CSV, Excel, JSON, or Google Sheets link. Clarix parses it instantly, entirely in your browser.',
                icon: (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>),
              },
              {
                num: '02', title: 'Transform', color: 'from-violet-500 to-purple-600', glow: 'shadow-violet-500/30',
                desc: 'AI auto-detects your column types and suggests the most impactful charts. Build custom ones in seconds.',
                icon: (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>),
              },
              {
                num: '03', title: 'Share & Export', color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/30',
                desc: 'Generate a live share link or download your dashboard as a PDF or high-resolution PNG.',
                icon: (<svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>),
              },
            ].map((step) => (
              <div key={step.num} className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${step.color} text-white flex items-center justify-center rounded-2xl mb-6 shadow-lg ${step.glow}`}>
                  {step.icon}
                </div>
                <div className="text-xs font-black tracking-widest text-zinc-300 dark:text-zinc-700 mb-2">{step.num}</div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
      <section className="relative w-full py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-10" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Ready to make your data beautiful?
          </h2>
          <p className="text-indigo-200 text-xl mb-10 font-medium">
            No sign-up required. Just upload your file and start creating.
          </p>
          <button
            id="cta-bottom-start"
            onClick={() => navigate('/upload')}
            className="group px-10 py-5 rounded-2xl bg-white text-indigo-700 font-black text-lg hover:bg-indigo-50 hover:-translate-y-1 shadow-2xl shadow-black/20 transition-all duration-300 inline-flex items-center gap-3"
          >
            Start for Free
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="w-full py-8 px-4 border-t border-zinc-100 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Clarix" className="w-7 h-7 rounded-lg object-contain bg-zinc-900" />
            <span className="font-bold text-zinc-900 dark:text-white">Clarix</span>
            <span className="text-zinc-400 text-sm">— Your data, visualized in seconds</span>
          </div>
          <p className="text-zinc-400 text-sm">&copy; 2026 Clarix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
