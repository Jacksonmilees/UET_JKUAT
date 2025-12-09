import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, ArrowRight, Users, Target, Heart } from 'lucide-react';
import { Route } from '../types';
import api from '../services/api';

interface HeroNewProps {
  setRoute?: (route: Route) => void;
  stats?: {
    totalDonors: number;
    totalRaised: number;
    totalProjects: number;
    successfulProjects: number;
  };
  onExploreClick?: () => void;
}

interface HeroImage {
  url: string;
  alt: string;
}

const HeroNew: React.FC<HeroNewProps> = ({ setRoute, stats, onExploreClick }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);

  // Default fallback images
  const defaultImages: HeroImage[] = [
    {
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop',
      alt: 'Community gathering'
    },
    {
      url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop',
      alt: 'Students collaborating'
    },
    {
      url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop',
      alt: 'Campus activities'
    },
    {
      url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop',
      alt: 'Fellowship'
    }
  ];

  // Fetch hero images from settings
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await api.settings.getPublic();
        if (response.success && response.data?.hero_images && response.data.hero_images.length > 0) {
          setHeroImages(response.data.hero_images);
        } else {
          setHeroImages(defaultImages);
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
        setHeroImages(defaultImages);
      }
    };
    fetchHeroImages();
  }, []);

  // Auto-rotate cards
  useEffect(() => {
    if (heroImages.length === 0) return;
    const interval = setInterval(() => {
      handleNextCard();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentCard, heroImages.length]);

  const handleNextCard = () => {
    if (isAnimating || heroImages.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentCard((prev) => (prev + 1) % heroImages.length);
      setIsAnimating(false);
    }, 300);
  };

  const handleCardClick = () => {
    handleNextCard();
  };

  const scrollToProjects = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">United in Faith & Purpose</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              <span className="block text-foreground">Empowering</span>
              <span className="block bg-gradient-to-r from-primary via-primary to-orange-500 bg-clip-text text-transparent">
                Our Community
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Join us in making a difference. Support projects, connect with members, and be part of something greater.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={scrollToProjects}
                className="group relative px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 flex items-center justify-center gap-2 overflow-hidden"
              >
                <span className="relative z-10">Explore Projects</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => setRoute?.({ page: 'merch' })}
                className="px-8 py-4 bg-secondary/50 hover:bg-secondary text-foreground font-medium rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Visit Shop
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 pt-8 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalDonors || 500}+</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.totalProjects || 25}+</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.successfulProjects || 100}%</p>
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Card Stack */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div 
              className="relative w-[280px] sm:w-[320px] lg:w-[380px] h-[350px] sm:h-[400px] lg:h-[480px] cursor-pointer"
              onClick={handleCardClick}
            >
              {/* Card Stack */}
              {heroImages.map((image, index) => {
                const isActive = index === currentCard;
                const isPrev = index === (currentCard - 1 + heroImages.length) % heroImages.length;
                const isNext = index === (currentCard + 1) % heroImages.length;
                const isFar = !isActive && !isPrev && !isNext;

                let transform = '';
                let zIndex = 0;
                let opacity = 0;

                if (isActive) {
                  transform = 'translateX(0) rotate(0deg) scale(1)';
                  zIndex = 30;
                  opacity = 1;
                } else if (isNext) {
                  transform = 'translateX(20px) translateY(10px) rotate(3deg) scale(0.95)';
                  zIndex = 20;
                  opacity = 0.7;
                } else if (isPrev) {
                  transform = 'translateX(-20px) translateY(10px) rotate(-3deg) scale(0.95)';
                  zIndex = 10;
                  opacity = 0.5;
                } else {
                  transform = 'translateX(0) translateY(20px) rotate(0deg) scale(0.9)';
                  zIndex = 0;
                  opacity = 0;
                }

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-out ${isAnimating && isActive ? 'animate-card-swipe' : ''}`}
                    style={{
                      transform,
                      zIndex,
                      opacity,
                    }}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Card Content Overlay */}
                    {isActive && (
                      <div className="absolute bottom-6 left-6 right-6 text-white animate-fade-in">
                        <p className="text-sm font-medium opacity-80 mb-1">Swipe to explore</p>
                        <p className="text-lg font-bold">{image.alt}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Card Indicators */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentCard(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentCard 
                        ? 'w-6 bg-primary' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-bounce">
        <span className="text-xs text-muted-foreground">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroNew;
