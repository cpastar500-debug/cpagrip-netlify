import React, { useState } from "react";
import { 
  Gift, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Trophy, 
  Sparkles,
  Zap,
  Smartphone
} from "lucide-react";

declare global {
  interface Window {
    ttq?: any;
  }
}

export default function Rewards() {
  const [step, setStep] = useState(1);
  const LEAD_URL = "https://filestrue.com/show.php?l=0&u=2489039&id=73006";

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (window.ttq) {
        window.ttq.track('CompleteRegistration');
      }
      window.location.href = LEAD_URL;
    }
  };

  const steps = [
    {
      id: 1,
      title: "Verify Account",
      description: "Quickly confirm your details to unlock premium reviewer status.",
      icon: ShieldCheck,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      button: "Verify & Continue"
    },
    {
      id: 2,
      title: "Choose Bonus",
      description: "Select an additional £50 voucher or a mystery gift box.",
      icon: Gift,
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      button: "Claim Bonus"
    },
    {
      id: 3,
      title: "Activate Rewards",
      description: "Finalise your profile to start receiving your fashion packages.",
      icon: Trophy,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      button: "Unlock All Rewards"
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans selection:bg-rose-500 selection:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(#fecdd3_1px,transparent_1px)] [background-size:20px_20px] opacity-20 -z-10"></div>
      
      <div className="max-w-xl w-full">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Step {step} of 3</h2>
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 w-8 rounded-full transition-all duration-500 ${s <= step ? 'bg-rose-500' : 'bg-neutral-200'}`}
                />
              ))}
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
            Exclusive <span className="text-rose-500">Bonus</span> Rewards
          </h1>
        </div>

        {/* Reward Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-rose-500/5 p-8 sm:p-12 border border-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`absolute top-0 right-0 w-32 h-32 ${currentStep.bgColor} rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50`}></div>
          
          <div className="relative z-10">
            <div className={`w-20 h-20 ${currentStep.bgColor} ${currentStep.color} rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-inner`}>
              <currentStep.icon className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-bold text-neutral-900 mb-4">{currentStep.title}</h3>
            <p className="text-lg text-neutral-600 mb-10 leading-relaxed">
              {currentStep.description}
            </p>

            <div className="space-y-4 mb-10">
              {[
                "Instant UK verification",
                "Priority shipping unlocked",
                "Bonus monthly allowance"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-neutral-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={nextStep}
              className="w-full h-16 bg-black text-white rounded-2xl font-bold text-xl hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 group"
            >
              {currentStep.button}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Social Proof Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-tighter">SECURE UK SERVER</span>
          </div>
          <div className="w-px h-4 bg-neutral-200"></div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-tighter">INSTANT ACTIVATION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
