
import React from 'react';

const WelcomeSection: React.FC = () => {
  const scrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-serif font-bold text-secondary-900 mb-4">
          Welcome to Our Community
        </h2>
        <p className="text-lg text-secondary-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          We are a fellowship united by faith, dedicated to spiritual growth and making a positive impact on our campus and beyond. This platform is where our mission comes to life through community-supported projects.
        </p>
        <a 
          href="#about"
          onClick={scrollToAbout}
          className="bg-primary-600 text-white font-bold py-3 px-8 rounded-md hover:bg-primary-700 transition duration-300 ease-in-out"
        >
          Learn More About Us
        </a>
      </div>
    </section>
  );
};

export default WelcomeSection;