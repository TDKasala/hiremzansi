import { Link } from "wouter";

export default function PreLaunchBanner() {
  return (
    <div className="bg-[#ffc107] text-neutral-900 py-3">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center">
          <span className="font-semibold mb-2 sm:mb-0 sm:mr-3">
            🚀 Pre-Launch Phase:
          </span>
          <span className="mb-2 sm:mb-0 sm:mr-3">
            We're fine-tuning ATSBoost for full launch soon.
          </span>
          <Link href="/contact">
            <a className="bg-neutral-900 text-white px-4 py-1 rounded text-sm font-medium hover:bg-opacity-80 transition-colors">
              Get Notified at Launch
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
