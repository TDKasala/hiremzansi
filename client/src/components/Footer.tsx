import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <div className="flex items-center mb-4 cursor-pointer">
                <div className="bg-amber-500 text-white font-bold p-2 rounded-lg mr-2">ATS</div>
                <span className="text-xl font-bold text-white">Boost</span>
                <span className="text-amber-500 text-xl font-bold">.co.za</span>
              </div>
            </Link>
            <p className="mb-4">
              Helping South Africans optimize their CVs for ATS systems and overcome
              the unemployment crisis with localized job market solutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="hover:text-amber-500 transition-colors">
                <Facebook />
              </a>
              <a href="https://twitter.com" className="hover:text-amber-500 transition-colors">
                <Twitter />
              </a>
              <a href="https://instagram.com" className="hover:text-amber-500 transition-colors">
                <Instagram />
              </a>
              <a href="https://linkedin.com" className="hover:text-amber-500 transition-colors">
                <Linkedin />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/analyzer">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">ATS Analyzer</div>
                </Link>
              </li>
              <li>
                <Link href="/cv-improvement">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">CV Improvement Tracker</div>
                </Link>
              </li>
              <li>
                <Link href="/job-matcher">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">Job Matcher</div>
                </Link>
              </li>
              <li>
                <Link href="/interview-simulator">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">Interview Simulator</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">Blog</div>
                </Link>
              </li>
              <li>
                <Link href="/job-sites">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">South African Job Sites</div>
                </Link>
              </li>
              <li>
                <Link href="/cv-templates">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">CV Templates</div>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">FAQ</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">About Us</div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">Contact</div>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">Pricing</div>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">Privacy Policy</div>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <div className="hover:text-amber-500 transition-colors cursor-pointer">Terms of Service</div>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>© {currentYear} ATSBoost.co.za. All rights reserved.</p>
          <p className="mt-2">
            Helping South Africans overcome the unemployment crisis with localized ATS optimization.
          </p>
        </div>
      </div>
    </footer>
  );
}