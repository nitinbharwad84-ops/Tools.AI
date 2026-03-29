import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Zap, Shield, Globe, Image as ImageIcon, CheckCircle2, Twitter, Linkedin, Instagram, Github, Mail, ExternalLink, FileText, Flame, Type, Video } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-gray-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.svg" alt="Nexus AI Logo" className="w-10 h-10 rounded-xl shadow-md shadow-primary/20 object-cover group-hover:scale-105 transition-transform duration-300" />
            <span className="text-xl font-bold tracking-tighter dark:text-white group-hover:text-primary transition-colors duration-300">Nexus AI</span>
          </div>
          <div className="flex items-center gap-6">
            <DarkModeToggle />
            <button 
              onClick={onStart}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-primary-dark hover:scale-105 transition-all shadow-lg shadow-primary/25"
            >
              Launch App <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] dark:text-gray-400"
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              All-in-One AI Productivity Suite
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-foreground"
            >
              Your Unified<br />
              <span className="text-primary italic font-serif font-light">AI Workspace.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed"
            >
              Replace your scattered AI tools with one seamless platform. Nexus AI brings the world's most powerful text, image, and video models together so you can create faster and work smarter.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onStart}
                className="px-10 py-5 bg-gradient-to-r from-primary to-indigo-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)]"
              >
                Start Creating Now <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-10 py-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-foreground rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                Explore Platform
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-8 pt-8 border-t border-gray-100 dark:border-slate-800"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-gray-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i+10}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Trusted by <span className="text-primary font-bold">5,000+</span> professionals worldwide
              </p>
            </motion.div>
          </div>

          {/* Visual Side */}
          <div className="relative lg:h-[700px] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 50 }}
              className="relative z-10 w-full max-w-md aspect-[3/4] bg-slate-900 rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(99,102,241,0.3)] border border-white/10"
            >
              <img 
                src="https://picsum.photos/seed/cyber-interface/800/1200" 
                alt="App Preview" 
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 space-y-4">
                <div className="w-12 h-12 bg-primary/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">The Nexus Hub</h3>
                <p className="text-gray-400 text-sm">A unified dashboard designed for speed. Switch between summarization, generation, and analysis in milliseconds.</p>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-radial from-gray-100 dark:from-slate-800/20 to-transparent opacity-50 -z-10" />
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-60" 
            />
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 left-0 w-40 h-40 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60" 
            />
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 dark:bg-slate-900/50 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Built for the <span className="text-primary italic font-serif">speed</span> of thought.</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Nexus AI isn't just another tool. It's an ecosystem of specialized agents working in harmony to eliminate friction from your creative process.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Cut Through Noise", desc: "Our Summarizer uses deep context analysis to distill hours of reading into seconds of insight." },
              { icon: Video, title: "Multimodal Vision", desc: "Upload videos to extract summaries, ask questions, and perform complex reasoning on visual data." },
              { icon: ImageIcon, title: "Visual Alchemy", desc: "Generate studio-grade assets or edit existing imagery with natural language instructions." },
              { icon: Globe, title: "Omnichannel Growth", desc: "Social Engine crafts cohesive campaigns that maintain your voice across every platform." },
              { icon: Flame, title: "Career Edge", desc: "The Resume Roaster provides the brutal honesty you need to stand out in a crowded job market." },
              { icon: Mail, title: "Diplomatic Immunity", desc: "Email Pacifier rewrites your most frustrated drafts into professional, high-impact messages." },
              { icon: CheckCircle2, title: "Flawless Delivery", desc: "Grammar Fixer goes beyond spelling, optimizing your tone and flow for maximum clarity." },
              { icon: Shield, title: "Enterprise Security", desc: "Your data remains yours. Nexus AI processes your information with state-of-the-art privacy controls." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group space-y-6 p-8 bg-white dark:bg-slate-800 rounded-[32px] border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-primary/5 group-hover:bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-colors">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold tracking-tighter">The <span className="text-primary italic font-serif">Nexus</span> Workflow.</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400">Complexity simplified into three elegant steps.</p>
              </div>
              
              <div className="space-y-10">
                {[
                  { step: "01", title: "Choose Your Agent", desc: "Select from our suite of specialized AI tools tailored for your specific task." },
                  { step: "02", title: "Provide Context", desc: "Upload files, paste links, or describe your vision in plain English." },
                  { step: "03", title: "Refine & Deploy", desc: "Iterate with the AI to perfect the output, then export directly to your workflow." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-8">
                    <span className="text-4xl font-black text-primary/20 font-mono leading-none">{item.step}</span>
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold">{item.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-primary/5 rounded-[60px] overflow-hidden border border-primary/10 p-8">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800 p-8 space-y-6 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-1/3 bg-gray-100 dark:bg-slate-800 rounded-full" />
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-50 dark:bg-slate-800/50 rounded-full" />
                    <div className="h-4 w-full bg-gray-50 dark:bg-slate-800/50 rounded-full" />
                    <div className="h-4 w-2/3 bg-gray-50 dark:bg-slate-800/50 rounded-full" />
                  </div>
                  <div className="aspect-video bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center relative">
                    <Sparkles className="w-12 h-12 text-primary/20 animate-pulse" />
                    <motion.div 
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-primary/5 to-transparent"
                    />
                  </div>
                  <div className="pt-4 flex justify-end">
                    <div className="h-10 w-32 bg-primary rounded-xl" />
                  </div>
                </div>
              </div>
              {/* Decorative blur */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-primary rounded-[60px] p-16 md:p-24 text-center text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(99,102,241,0.4)]">
          <div className="relative z-10 space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">Ready to enter the <span className="italic font-serif font-light">Nexus</span>?</h2>
            <p className="text-xl text-white/70 max-w-xl mx-auto">Join thousands of professionals who have reclaimed their time with our unified AI suite.</p>
            <button 
              onClick={onStart}
              className="px-12 py-6 bg-white text-primary rounded-2xl font-bold text-xl hover:scale-105 transition-transform shadow-xl"
            >
              Launch Platform Now
            </button>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-gray-200 dark:border-slate-900 pt-20 pb-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Nexus AI Logo" className="w-8 h-8 rounded-xl shadow-md object-cover" />
                <span className="text-xl font-bold tracking-tighter dark:text-white">Nexus AI</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                The unified intelligence layer for modern teams. Consolidating the world's most powerful AI tools into a single, high-performance workspace.
              </p>
              <div className="flex gap-3 pt-2">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary hover:shadow-sm transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 lg:col-start-6">
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-900 dark:text-gray-100">Platform</h4>
              <ul className="space-y-3 text-sm">
                {["Video Analyzer", "Image Studio", "Social Engine", "Text Summarizer", "Resume Roaster"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-900 dark:text-gray-100">Resources</h4>
              <ul className="space-y-3 text-sm">
                {["Documentation", "API Reference", "Community", "Help Center"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-gray-900 dark:text-gray-100">Stay Updated</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Get the latest AI breakthroughs delivered to your inbox.</p>
              <div className="flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none dark:text-white"
                />
                <button className="p-2 bg-primary text-white rounded-lg hover:bg-indigo-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">
              © 2026 Nexus AI. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">System Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
