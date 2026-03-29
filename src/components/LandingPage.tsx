import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Zap, Shield, Globe, Image as ImageIcon, CheckCircle2, Twitter, Linkedin, Instagram, Github, Mail, ExternalLink } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">S</div>
          <span className="text-xl font-bold tracking-tighter dark:text-white">SocialGen AI</span>
        </div>
        <div className="flex items-center gap-6">
          <DarkModeToggle />
          <button 
            onClick={onStart}
            className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity dark:text-white"
          >
            Launch App <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] dark:text-gray-400"
            >
              <Sparkles className="w-3 h-3 text-orange-500" />
              Next-Gen Content Engine
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] text-foreground"
            >
              One Idea.<br />
              <span className="text-primary italic font-serif font-light">Infinite</span><br />
              Reach.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed"
            >
              Stop wasting hours on platform-specific formatting. SocialGen AI crafts perfect posts for LinkedIn, X, and Instagram with studio-quality visuals in one click.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onStart}
                className="px-10 py-5 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20"
              >
                Start Generating Free <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-10 py-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-foreground rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                View Showcase
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-8 pt-8 border-t border-gray-100"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Trusted by <span className="text-primary font-bold">2,000+</span> creators worldwide
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
                src="https://picsum.photos/seed/social-media/800/1200" 
                alt="App Preview" 
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 space-y-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tight">AI Visuals Included</h3>
                <p className="text-gray-400 text-sm">Every post comes with a unique, platform-optimized image generated by Gemini 3 Pro.</p>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-radial from-gray-100 to-transparent opacity-50 -z-10" />
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-0 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-60" 
            />
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-10 left-0 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-60" 
            />
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 dark:bg-slate-900/50 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything you need to <span className="text-primary italic font-serif">dominate</span> social.</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Powerful AI tools designed for modern creators and marketing teams.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Zap, title: "Instant Generation", desc: "Go from idea to full campaign in under 30 seconds with Gemini 3 Pro." },
              { icon: Globe, title: "Multi-Platform", desc: "Native formatting and hashtag strategies for LinkedIn, X, and Instagram." },
              { icon: Shield, title: "Brand Safe", desc: "AI-powered tone control ensures your message stays professional and on brand." },
              { icon: ImageIcon, title: "AI Visuals", desc: "Studio-quality images generated specifically for each post's context." },
              { icon: Sparkles, title: "Smart Trends", desc: "Integrated Google Search ensures your content is always relevant and timely." },
              { icon: CheckCircle2, title: "One-Click Export", desc: "Copy or share your posts directly to your favorite social platforms." }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group space-y-6 p-10 bg-white dark:bg-slate-800 rounded-[40px] border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-primary/5 group-hover:bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-colors">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
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
                <h2 className="text-5xl font-bold tracking-tighter">How it <span className="text-primary italic font-serif">works</span>.</h2>
                <p className="text-xl text-gray-500 dark:text-gray-400">Three simple steps to social media mastery.</p>
              </div>
              
              <div className="space-y-10">
                {[
                  { step: "01", title: "Input Your Idea", desc: "Describe your core concept, product, or news in a few words." },
                  { step: "02", title: "Select Tone & Platforms", desc: "Choose your voice and where you want to publish." },
                  { step: "03", title: "Generate & Refine", desc: "Get perfect posts and visuals, then tweak them to perfection." }
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
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-slate-800 p-8 space-y-6">
                  <div className="h-4 w-1/3 bg-gray-100 dark:bg-slate-800 rounded-full" />
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-50 dark:bg-slate-800/50 rounded-full" />
                    <div className="h-4 w-full bg-gray-50 dark:bg-slate-800/50 rounded-full" />
                    <div className="h-4 w-2/3 bg-gray-50 dark:bg-slate-800/50 rounded-full" />
                  </div>
                  <div className="aspect-video bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-200 dark:text-slate-700" />
                  </div>
                </div>
              </div>
              {/* Decorative blur */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-900 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">S</div>
                <span className="text-xl font-bold tracking-tighter dark:text-white">SocialGen AI</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Empowering creators with next-generation AI content tools. One idea, infinite reach.
              </p>
              <div className="flex gap-4">
                {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full border border-gray-100 dark:border-slate-800 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-8 uppercase tracking-widest text-xs text-gray-400">Product</h4>
              <ul className="space-y-4">
                {["Features", "Showcase", "Pricing", "API"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-8 uppercase tracking-widest text-xs text-gray-400">Company</h4>
              <ul className="space-y-4">
                {["About", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="font-bold mb-8 uppercase tracking-widest text-xs text-gray-400">Newsletter</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get the latest AI social tips delivered to your inbox.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button className="p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-100 dark:border-slate-900 flex flex-col md:row justify-between items-center gap-6">
            <p className="text-sm text-gray-400">
              © 2026 SocialGen AI. Built with Gemini 3 Pro.
            </p>
            <div className="flex gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
