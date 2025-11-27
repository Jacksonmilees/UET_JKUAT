import React from 'react';
import { Rocket, Info, Sparkles } from 'lucide-react';

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
      className="relative bg-background text-foreground flex items-center justify-center overflow-hidden min-h-[85vh] border-b border-border"
    >
      {/* Background with Overlay */}
      <div
        className="absolute inset-0 z-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2673&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background z-0"></div>

      {/* Animated Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative container mx-auto px-6 py-12 z-10 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-md mb-8 animate-fade-in shadow-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Empowering Faith & Community</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 tracking-tight">
          <span className="block text-foreground">UET JKUAT</span>
          <span className="text-primary drop-shadow-sm">
            Funding Platform
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Join the movement. Support impactful projects, purchase merchandise, and help us build a stronger, more vibrant ministry.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up">
          <a
            href="#projects"
            onClick={scrollToProjects}
            className="group relative px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore Projects <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href="#about"
            className="px-8 py-4 bg-secondary/50 hover:bg-secondary text-foreground font-medium rounded-xl border border-border backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-3"
          >
            Learn More <Info className="w-5 h-5" />
          </a>
        </div>

        {/* Stats / Social Proof (Optional) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 border-t border-border pt-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">50+</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Projects</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">100%</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Transparent</p>
          </div>
          <div className="hidden md:block text-center">
            <p className="text-3xl font-bold text-foreground">24/7</p>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">Support</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
