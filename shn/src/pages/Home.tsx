import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Star,
  CheckCircle,
  Gift,
  PoundSterling,
  Clock,
  ArrowRight,
  ShieldCheck,
  Users,
  Zap,
  Smartphone,
  ChevronRight,
} from "lucide-react";

declare global {
  interface Window {
    ttq?: any;
  }
}

import heroImage from "@assets/stock_images/happy_young_woman_fa_4538edf1.jpg";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [device, setDevice] = useState("");
  const LEAD_URL = "https://filestrue.com/show.php?l=0&u=2489039&id=73006";

  const handleCtaClick = () => {
    if (window.ttq) {
      window.ttq.track("Lead");
    }

    setTimeout(() => {
      window.location.href = LEAD_URL;
    }, 300);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white font-sans">
        <div className="absolute inset-0 bg-rose-50/30 -z-10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>

        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 sm:p-12 border border-rose-100 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-2xl text-rose-600 mb-6">
              <Smartphone className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-3 tracking-tight">
              Select Your Device
            </h1>
            <p className="text-neutral-500">
              Please select your primary mobile device to check for local program
              availability.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700 ml-1">
                Primary Smartphone
              </label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full h-14 bg-neutral-50 border border-neutral-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all appearance-none cursor-pointer text-neutral-800"
              >
                <option value="" disabled>
                  Choose your device...
                </option>
                <option value="iphone">Apple iPhone (iOS)</option>
                <option value="android">Android Smartphone</option>
              </select>
            </div>

            <button
              onClick={() => device && setHasStarted(true)}
              disabled={!device}
              className="w-full h-14 bg-rose-500 text-white rounded-xl font-bold text-lg hover:bg-rose-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
            >
              Continue to Application
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs text-neutral-400">
              * Your selection helps us provide the correct app version for your
              reviews.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900 selection:bg-black selection:text-white animate-in fade-in duration-700">
      {/* Announcement Bar */}
      <div className="bg-black text-white text-xs font-medium py-2 text-center tracking-wide px-4 uppercase">
        LIMITED SPOTS AVAILABLE FOR UNITED KINGDOM COHORT
      </div>

      {/* Navigation */}
      <nav className="border-b border-neutral-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="text-xl font-bold tracking-tighter uppercase">
            SHEIN<span className="font-light">UK</span>
          </div>
          <button
            onClick={handleCtaClick}
            className="hidden sm:block bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-12 pb-20 sm:pt-20 sm:pb-24 px-4 overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-8 animate-in slide-in-from-left-4 fade-in duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Accepting UK Applicants
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight uppercase">
                  Earn <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500">
                    Paid Reviews
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-neutral-600 max-w-lg leading-relaxed">
                  Join the UK's leading reviewer program. Receive complimentary
                  items and earn money for your honest feedback.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={handleCtaClick}
                    className="h-14 px-8 rounded-full bg-rose-500 text-white font-semibold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 group"
                  >
                    Apply for Selection
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-white bg-neutral-200 overflow-hidden"
                        >
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 25}`}
                            alt="User"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-sm">
                      <div className="flex text-neutral-900">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <span className="font-semibold">4.9/5</span> rating
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative animate-in slide-in-from-right-4 fade-in duration-1000 delay-200">
                <div className="absolute inset-0 bg-rose-100 rounded-[2.5rem] rotate-3 scale-[0.95] blur-3xl opacity-50 -z-10"></div>
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-square">
                  <img
                    src={heroImage}
                    alt="British fashion style"
                    className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50">
                    <div className="flex items-center gap-4">
                      <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                        <PoundSterling className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm text-neutral-500">
                          Avg. Monthly Earnings
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">
                          £400+
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-neutral-50 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 uppercase tracking-tight">
                Program Perks
              </h2>
              <p className="text-neutral-600">
                Premium benefits for our selected UK reviewer community.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Gift,
                  title: "Free Items",
                  desc: "Keep all products you review from the latest seasonal collections.",
                },
                {
                  icon: PoundSterling,
                  title: "Direct Payouts",
                  desc: "Earn competitive rates per review, paid directly to your chosen method.",
                },
                {
                  icon: Zap,
                  title: "Priority Access",
                  desc: "Get exclusive first-look access to limited edition drops.",
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center mb-6">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 uppercase text-sm tracking-wider">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-8">
                  How It Works
                </h2>
                <div className="space-y-8">
                  {[
                    {
                      step: "01",
                      title: "Apply",
                      desc: "Fill out our simple application form and tell us about your style.",
                    },
                    {
                      step: "02",
                      title: "Get Selected",
                      desc: "Our team reviews applications and notifies selected reviewers.",
                    },
                    {
                      step: "03",
                      title: "Receive Products",
                      desc: "Get products delivered directly to your doorstep for free.",
                    },
                    {
                      step: "04",
                      title: "Get Paid",
                      desc: "Submit your review and earn rewards immediately.",
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="font-mono text-xl font-bold text-neutral-300 pt-1">
                        {step.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-neutral-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10">
                  <button
                    onClick={handleCtaClick}
                    className="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-neutral-800 transition-colors"
                  >
                    Start Your Application
                  </button>
                </div>
              </div>
              <div className="bg-neutral-100 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-purple-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                        EW
                      </div>
                      <div>
                        <div className="font-bold">Emma W.</div>
                        <div className="text-xs text-neutral-500">
                          Fashion Blogger
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-700 italic">
                      "Being a reviewer has allowed me to expand my wardrobe
                      while earning money. The process is incredibly
                      straightforward!"
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg transform rotate-[2deg] hover:rotate-0 transition-transform duration-300 translate-x-4 md:translate-x-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        AT
                      </div>
                      <div>
                        <div className="font-bold">Alex T.</div>
                        <div className="text-xs text-neutral-500">
                          Style Influencer
                        </div>
                      </div>
                    </div>
                    <p className="text-neutral-700 italic">
                      "I love how my feedback actually makes a difference. I've
                      seen my suggestions implemented in newer versions!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="py-24 bg-black text-white px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
              Ready to join the team?
            </h2>
            <p className="text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
              Apply today and start receiving complimentary fashion items while
              earning money for your honest reviews.
            </p>
            <button
              onClick={handleCtaClick}
              className="px-10 py-4 bg-rose-500 text-white rounded-full font-bold text-lg hover:bg-rose-600 transition-colors transform hover:-translate-y-1 shadow-2xl shadow-rose-500/20"
            >
              Apply Now
            </button>
            <p className="mt-8 text-sm text-neutral-500">
              * Limited spots available for current cohort. Applications
              reviewed on rolling basis.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
