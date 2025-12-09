import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Quote, Award, Mail, ExternalLink } from 'lucide-react';

interface ChairpersonSectionProps {
  compact?: boolean;
}

const ChairpersonSection: React.FC<ChairpersonSectionProps> = ({ compact = false }) => {
  const { settings, loading } = useSettings();

  // Default values if not set in settings
  const chairName = settings.chair_name || 'Boniface Mwanzia David';
  const chairTitle = settings.chair_title || 'Chairperson – UET JKUAT (2025/2026)';
  const chairImage = settings.chair_image || 'https://i.pravatar.cc/400?u=boniface-chair';

  if (loading) {
    return (
      <div className="bg-card rounded-3xl border border-border p-8 animate-pulse">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-secondary" />
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-secondary rounded w-32" />
            <div className="h-10 bg-secondary rounded w-64" />
            <div className="h-4 bg-secondary rounded w-full" />
            <div className="h-4 bg-secondary rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="group relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-2xl border border-border hover:border-primary/30 p-6 transition-all duration-500">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="relative flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
            <img
              src={chairImage}
              alt={chairName}
              className="relative w-20 h-20 rounded-xl object-cover shadow-lg ring-2 ring-primary/20"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary mb-1">{chairTitle}</p>
            <h4 className="font-bold text-foreground text-lg truncate">{chairName}</h4>
            <p className="text-sm text-muted-foreground mt-1">Leading with vision & purpose</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden bg-card rounded-3xl border border-border shadow-sm">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      
      <div className="relative p-8 md:p-12">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* Image Section */}
          <div className="relative flex-shrink-0 group">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-500 to-primary rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 scale-105" />
            
            {/* Image Container */}
            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/10">
              <img
                src={chairImage}
                alt={chairName}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            {/* Badge */}
            <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="text-sm font-bold">2025/2026</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left">
            {/* Title Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-primary">{chairTitle}</span>
            </div>

            {/* Name */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 leading-tight">
              {chairName}
            </h2>
            
            <p className="text-lg text-muted-foreground font-medium mb-6">
              Bachelor of Science in Banking and Finance
            </p>

            {/* Bio */}
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                Currently serving as the Chairperson of the Uttermost Evangelistic Team (UET), 
                JKUAT Chapter. With a background in leadership and a heart for ministry, 
                the vision is to lead this team into a profound knowledge of Jesus Christ.
              </p>
            </div>

            {/* Quote */}
            <div className="relative bg-secondary/50 rounded-2xl p-6 border border-border">
              <Quote className="absolute top-4 left-4 w-8 h-8 text-primary/20" />
              <blockquote className="relative z-10 pl-8 italic text-foreground font-medium">
                "But grow in the grace and knowledge of our Lord and Savior Jesus Christ. 
                To Him be glory both now and forever! Amen."
              </blockquote>
              <p className="mt-3 pl-8 text-sm text-muted-foreground">— 2 Peter 3:18</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-md">
                <Mail className="w-4 h-4" />
                Contact
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors border border-border">
                <ExternalLink className="w-4 h-4" />
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChairpersonSection;
