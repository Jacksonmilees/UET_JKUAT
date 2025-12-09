import React from 'react';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-secondary-950 text-secondary-400 border-t border-secondary-900">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-primary-950 text-sm">U</span>
              UET JKUAT
            </h3>
            <p className="text-secondary-500 leading-relaxed">
              Empowering the JKUAT Christian Union community through faith, funding, and fellowship.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#projects" className="hover:text-primary-400 transition-colors">Projects</a></li>
              <li><a href="#about" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Connect With Us</h3>
            <div className="flex flex-col items-center md:items-start gap-3 mb-6">
              <p className="flex items-center gap-2 hover:text-white transition-colors">
                <MapPin className="w-4 h-4 text-primary-500" /> Juja, Kenya
              </p>
              <a href="mailto:support@uetjkuat.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-primary-500" /> support@uetjkuat.com
              </a>
              <a href="tel:+254700088271" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-primary-500" /> 0700 088 271
              </a>
            </div>

            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="p-2 bg-secondary-900 rounded-full hover:bg-primary-500 hover:text-primary-950 transition-all duration-300 group">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-secondary-900 rounded-full hover:bg-primary-500 hover:text-primary-950 transition-all duration-300 group">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-secondary-900 rounded-full hover:bg-primary-500 hover:text-primary-950 transition-all duration-300 group">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-900 mt-12 pt-8 text-center text-secondary-600 text-sm">
          <p>&copy; {new Date().getFullYear()} UET JKUAT Funding Platform. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;