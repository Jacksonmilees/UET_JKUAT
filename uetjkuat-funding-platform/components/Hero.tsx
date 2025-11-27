
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
      className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url(https://picsum.photos/seed/church/1600/900)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 'calc(100vh - 73px)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/85 to-purple-900/90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative container mx-auto px-6 py-24 md:py-32 text-center z-10">
        <div className="mb-6 inline-block">
          <span className="text-6xl md:text-8xl animate-bounce">✨</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-white">
          <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            UET JKUAT
          </span>
          <br />
          <span className="text-3xl md:text-5xl font-semibold text-blue-100">
            Empowering Faith, Building Community 🙏
          </span>
        </h1>
        <p className="text-lg md:text-2xl text-blue-100 max-w-4xl mx-auto mb-10 leading-relaxed">
          Join the <span className="font-bold text-yellow-300">Uttermost Evangelistic Team (UET) JKUAT</span> in funding projects that make a difference. Your contribution, big or small, helps us build a stronger, more vibrant campus ministry and spread the Gospel to the ends of the earth. 🌍
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            href="#projects"
            onClick={scrollToProjects}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition duration-300 ease-in-out transform hover:scale-110 shadow-2xl hover:shadow-blue-500/50 flex items-center gap-2"
          >
            Explore Projects 🚀
          </a>
          <a 
            href="#about"
            className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-10 rounded-2xl hover:bg-white/20 transition duration-300 ease-in-out transform hover:scale-110 shadow-2xl flex items-center gap-2"
          >
            Learn More 📖
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
