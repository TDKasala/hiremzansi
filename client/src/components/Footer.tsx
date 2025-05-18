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
              <a className="flex items-center mb-4">
                <div className="bg-amber-500 text-white font-bold p-2 rounded-lg mr-2">ATS</div>
                <span className="text-xl font-bold text-white">Boost</span>
                <span className="text-amber-500 text-xl font-bold">.co.za</span>
              </a>
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
                  <a className="hover:text-amber-500 transition-colors">ATS Analyzer</a>
                </Link>
              </li>
              <li>
                <Link href="/cv-improvement">
                  <a className="hover:text-amber-500 transition-colors">CV Improvement Tracker</a>
                </Link>
              </li>
              <li>
                <Link href="/job-matcher">
                  <a className="hover:text-amber-500 transition-colors">Job Matcher</a>
                </Link>
              </li>
              <li>
                <Link href="/interview-simulator">
                  <a className="hover:text-amber-500 transition-colors">Interview Simulator</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog">
                  <a className="hover:text-amber-500 transition-colors">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/job-sites">
                  <a className="hover:text-amber-500 transition-colors">South African Job Sites</a>
                </Link>
              </li>
              <li>
                <Link href="/cv-templates">
                  <a className="hover:text-amber-500 transition-colors">CV Templates</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="hover:text-amber-500 transition-colors">FAQ</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about">
                  <a className="hover:text-amber-500 transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-amber-500 transition-colors">Contact</a>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <a className="hover:text-amber-500 transition-colors">Pricing</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="hover:text-amber-500 transition-colors">Privacy Policy</a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="hover:text-amber-500 transition-colors">Terms of Service</a>
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