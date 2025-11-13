
import React from 'react';

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
      className="relative bg-secondary-800 text-white flex items-center justify-center"
      style={{
        backgroundImage: 'url(https://picsum.photos/seed/church/1600/900)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 'calc(100vh - 73px)', // Adjust based on header height
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/80 via-secondary-950/50 to-transparent"></div>
      <div className="relative container mx-auto px-6 py-24 md:py-32 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-4 text-white shadow-lg">
          UET JKUAT - Empowering Faith, Building Community
        </h1>
        <p className="text-lg md:text-xl text-secondary-200 max-w-3xl mx-auto mb-8">
          Join the Uttermost Evangelistic Team (UET) JKUAT in funding projects that make a difference. Your contribution, big or small, helps us build a stronger, more vibrant campus ministry and spread the Gospel to the ends of the earth.
        </p>
        <a 
          href="#projects"
          onClick={scrollToProjects}
          className="bg-primary-600 text-white font-bold py-3 px-8 rounded-full hover:bg-primary-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Explore Projects
        </a>
      </div>
    </section>
  );
};

export default Hero;
