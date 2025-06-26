import { Link } from "wouter";
import { ChartLine } from "lucide-react";
import { 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaFacebook,
  FaLinkedin
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import hireMzansiLogo from "@assets/Fresh Hire Mzansi Logo with Blue and Green Palette_1749062584652.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <img src={hireMzansiLogo} alt="Hire Mzansi Logo" className="h-8 mr-2" />
              <span>
                <span className="text-[#2B5A87]">HIRE</span><span className="text-[#5CB85C]">MZANSI</span>
                <span className="text-[#5CB85C] ml-1">•</span>
              </span>
            </h3>
            <p className="text-neutral-400 mb-4">
              Connecting South African job seekers with opportunities and optimizing CVs for success.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com/hiremzansi" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <FaInstagram />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-neutral-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#upload" className="text-neutral-400 hover:text-white transition-colors">
                  Free ATS Score
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-neutral-400 hover:text-white transition-colors">
                  CV Templates
                </Link>
              </li>
              <li>
                <Link href="/skills-quiz" className="text-neutral-400 hover:text-white transition-colors">
                  Skills Quiz
                </Link>
              </li>
              <li>
                <Link href="/interview-practice" className="text-neutral-400 hover:text-white transition-colors">
                  Interview Practice
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors">
                  CV Tips
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#faq" className="text-neutral-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FaEnvelope className="mt-1 mr-2 text-neutral-400" />
                <span className="text-neutral-400">support@hiremzansi.co.za</span>
              </li>
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-2 text-neutral-400" />
                <span className="text-neutral-400">Cape Town, South Africa</span>
              </li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="https://twitter.com/hiremzansi" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <FaTwitter className="text-xl" />
              </a>
              <a href="https://linkedin.com/company/hiremzansi" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <FaLinkedinIn className="text-xl" />
              </a>
              <a href="https://facebook.com/hiremzansi" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                <FaFacebookF className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-700 pt-6 text-neutral-400 text-sm flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            &copy; {currentYear} Hire Mzansi. All rights reserved.
          </div>
          <div>
            <span>Built for South African job seekers | POPIA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
