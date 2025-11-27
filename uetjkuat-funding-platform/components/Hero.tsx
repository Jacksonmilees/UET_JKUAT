import React from 'react';
import { Rocket, Info, ChevronRight, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToProjects = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative bg-secondary-900 text-white flex items-center justify-center overflow-hidden min-h-[85vh]"
    >
      {/* Background with Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop)', // High quality abstract/texture
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/80 via-secondary-900/90 to-secondary-900 z-0"></div>
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative container mx-auto px-6 py-12 z-10 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-800/50 border border-secondary-700 backdrop-blur-md mb-8 animate-fade-in shadow-glass">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-primary-100">Empowering Faith & Community</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6 tracking-tight">
          <span className="block text-secondary-50">UET JKUAT</span>
          <span className="bg-gradient-to-r from-primary-300 via-primary-500 to-primary-400 bg-clip-text text-transparent drop-shadow-sm">
            Funding Platform
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-secondary-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Join the movement. Support impactful projects, purchase merchandise, and help us build a stronger, more vibrant ministry.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up">
          <a 
            href="#projects"
            onClick={scrollToProjects}
            className="group relative px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Projects <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          
          <a 
            href="#about"
            className="px-8 py-4 bg-secondary-800/50 hover:bg-secondary-800 text-secondary-100 font-medium rounded-xl border border-secondary-700 backdrop-blur-sm transition-all duration-300 hover:border-primary-500/50 flex items-center justify-center gap-3"
          >
            Learn More <Info className="w-5 h-5" />
          </a>
        </div>

        {/* Stats / Social Proof (Optional) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 border-t border-secondary-800/50 pt-8">
            <div className="text-center">
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-sm text-secondary-400 uppercase tracking-wider">Projects</p>
            </div>
            <div className="text-center">
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-sm text-secondary-400 uppercase tracking-wider">Transparent</p>
            </div>
             <div className="hidden md:block text-center">
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-sm text-secondary-400 uppercase tracking-wider">Support</p>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
