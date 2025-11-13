
import React from 'react';
import { IconFacebook, IconInstagram, IconTwitter } from './icons';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-secondary-900 text-secondary-300">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-4">UETJKUAT Funding</h3>
            <p className="text-secondary-400">
              A community-driven platform to support the mission and projects of the JKUAT Christian Union.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#projects" className="hover:text-white transition-colors">Projects</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-4">Connect With Us</h3>
            <p className="mb-2 text-secondary-400">Juja, Kenya</p>
            <p className="mb-4 text-secondary-400">Email: info@uetjkuat.org</p>
            <div className="flex justify-center md:justify-start space-x-4 mt-2">
              <a href="#" className="text-secondary-400 hover:text-white transition-colors"><IconFacebook /></a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors"><IconTwitter /></a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors"><IconInstagram /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-secondary-700 mt-10 pt-6 text-center text-secondary-500">
          <p>&copy; {new Date().getFullYear()} UETJKUAT Funding Platform. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;