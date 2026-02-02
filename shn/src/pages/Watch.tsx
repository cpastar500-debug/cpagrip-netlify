import React, { useState, useEffect } from "react";
import { Smartphone, ChevronRight, CheckCircle2, ShieldCheck, Zap, Star, ArrowRight } from "lucide-react";

export default function Watch() {
  const [hasStarted, setHasStarted] = useState(false);
  const [device, setDevice] = useState("");
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const LEAD_URL = "https://singingfiles.com/show.php?l=0&u=2489039&id=73920";

  const handleCtaClick = () => {
    window.location.href = LEAD_URL;
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
    }, 2000);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#06070a] flex items-center justify-center p-4 selection:bg-[#fe2c55] selection:text-white font-sans text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -z-10"></div>
        
        <div className="max-w-md w-full bg-[#121212] rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-white/5 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fe2c55] to-[#25f4ee]"></div>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fe2c55]/10 rounded-2xl text-[#fe2c55] mb-6">
              <Smartphone className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Access Beta</h1>
            <p className="text-neutral-400">Select your mobile platform to proceed to the TikTok Earning Dashboard.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-300 ml-1">Device OS</label>
              <select 
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full h-14 bg-black border border-white/10 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50 transition-all appearance-none cursor-pointer text-white"
              >
                <option value="" disabled>Select your device...</option>
                <option value="ios">iOS (Apple iPhone)</option>
                <option value="android">Android Smartphone</option>
              </select>
            </div>

            <button
              onClick={() => device && setHasStarted(true)}
              disabled={!device}
              className="w-full h-14 bg-white text-black rounded-xl font-bold text-lg hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
            >
              Continue to Dashboard
              <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-500 uppercase tracking-widest pt-2 font-bold">
              <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure</div>
              <div className="flex items-center gap-1"><Zap className="w-3 h-3" /> Live</div>
              <div className="flex items-center gap-1"><Star className="w-3 h-3" /> 4.9/5</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] text-white font-sans selection:bg-[#fe2c55] selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-[#06070a]/80 backdrop-blur-xl sticky top-0 z-50 px-6">
        <div className="container mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-black italic">T</div>
            <span className="font-bold tracking-tight text-lg">TokOption</span>
          </div>
          <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
            Beta Access Live
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-16 pb-20 px-6 text-center">
          <div className="container mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter leading-[0.9]">
              Get Paid to Watch <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fe2c55] to-[#25f4ee]">TikTok Videos</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Join the exclusive Beta program. Monetize your screentime today. No downloads required.
            </p>

            <form onSubmit={handleUsernameSubmit} className="max-w-md mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-1000"></div>
              <div className="relative flex bg-black border border-white/10 rounded-2xl p-2">
                <div className="flex items-center pl-4 text-neutral-500 font-bold">@</div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your TikTok username"
                  className="w-full bg-transparent px-2 py-4 focus:outline-none font-medium"
                />
                <button 
                  type="submit"
                  className="bg-white text-black px-6 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-neutral-200 transition-colors"
                >
                  Check Eligibility
                </button>
              </div>
            </form>

            {isChecking && (
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center justify-center gap-3 text-sm font-bold text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                  Analyzing profile data...
                </div>
              </div>
            )}

            {!isChecking && username && (
              <div className="bg-[#121212] rounded-3xl p-8 border border-white/5 space-y-4 animate-in zoom-in duration-500">
                 <div className="text-neutral-500 text-xs font-black uppercase tracking-widest">Estimated Weekly Earnings</div>
                 <div className="text-5xl font-black">
                   <span className="text-green-500">$450.00</span> 
                   <span className="text-neutral-600 mx-2">—</span>
                   <span className="text-green-500">$850.00</span>
                 </div>
                 <button onClick={handleCtaClick} className="w-full h-16 bg-[#fe2c55] text-white rounded-2xl font-black text-xl hover:brightness-110 transition-all shadow-2xl shadow-[#fe2c55]/20">
                   Start Earning Now
                 </button>
                 <div className="flex items-center justify-center gap-6 text-[10px] text-neutral-600 font-bold uppercase tracking-widest pt-2">
                   <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Secure & Verified</div>
                   <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 15,000+ Active Users</div>
                 </div>
              </div>
            )}
          </div>
        </section>

        {/* Live Feed */}
        <section className="pb-32 px-6">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-500">Live Payout Feed</h2>
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                Live
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: "Sarah D.", amount: "1,539", action: "reviewing this week" },
                { name: "Mike T.", amount: "2,847", action: "watching videos" },
                { name: "Jessica K.", amount: "892", action: "completing tasks today" },
                { name: "Alex R.", amount: "3,204", action: "reviewing this month" }
              ].map((p, i) => (
                <div key={i} className="bg-[#121212]/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-xs">{p.name[0]}</div>
                    <div>
                      <div className="font-bold text-sm">{p.name}</div>
                      <div className="text-[10px] text-neutral-500">Earned <span className="text-green-500">${p.amount}</span> from {p.action}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-600 font-bold">Just now</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bento Steps */}
        <section className="pb-32 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#121212] rounded-[2rem] p-8 border border-white/5 space-y-6">
                 <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-black">1</div>
                 <h3 className="text-xl font-bold">Create Account</h3>
                 <p className="text-neutral-500 text-sm">Enter your username to join the TikTok Earning Beta.</p>
                 <div className="pt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                    <div>30 Sec Signup</div>
                    <div>No Credit Card</div>
                 </div>
              </div>
              <div className="bg-[#121212] rounded-[2rem] p-8 border border-white/5 space-y-6 md:col-span-2 relative overflow-hidden group">
                 <div className="relative z-10">
                   <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-black mb-6">2</div>
                   <h3 className="text-xl font-bold">Watch & Earn</h3>
                   <p className="text-neutral-500 text-sm max-w-xs">Watch short TikTok clips daily — each completed view adds to your balance.</p>
                   <div className="mt-8 flex gap-4">
                      <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-neutral-600 font-black uppercase mb-1">Today's Balance</div>
                        <div className="text-xl font-black text-green-500">$42.50</div>
                      </div>
                      <div className="bg-black/50 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-neutral-600 font-black uppercase mb-1">Goal Progress</div>
                        <div className="text-xl font-black">85%</div>
                      </div>
                   </div>
                 </div>
                 <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#fe2c55]/10 to-transparent pointer-events-none group-hover:from-[#fe2c55]/20 transition-all"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 text-center text-neutral-600 text-xs">
        <div className="container mx-auto space-y-6">
           <div className="flex items-center justify-center gap-2">
             <div className="w-5 h-5 bg-white text-black rounded flex items-center justify-center font-black italic text-[10px]">T</div>
             <span className="font-bold tracking-tight">TokOption</span>
           </div>
           <p>© 2026 TokOption Global Ltd. All rights reserved.</p>
           <div className="flex items-center justify-center gap-6">
             <a href="#" className="hover:text-white transition-colors">Terms</a>
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <button onClick={handleCtaClick} className="text-[#fe2c55] font-bold">Contact Support</button>
           </div>
        </div>
      </footer>
    </div>
  );
}
