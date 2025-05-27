import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star, StarHalf, ChevronDown, ChevronUp } from "lucide-react";

type Testimonial = {
  rating: number;
  text: string;
  author: {
    image: string;
    name: string;
    title: string;
  };
};

export default function TestimonialsSection() {
  const [sectionOpen, setSectionOpen] = useState(false);
  
  const testimonials: Testimonial[] = [
    {
      rating: 5,
      text: "After 6 months of job hunting with no callbacks, I used ATSBoost to optimize my CV. Within 2 weeks, I had 3 interview requests! Now I'm working at a major bank in Johannesburg.",
      author: {
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        name: "Thabo M.",
        title: "Financial Analyst, Johannesburg"
      }
    },
    {
      rating: 4.5,
      text: "The deep analysis report was eye-opening! I didn't realize how many keywords my CV was missing. After implementing the suggested changes, my interview rate increased dramatically.",
      author: {
        image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        name: "Nomsa K.",
        title: "Marketing Specialist, Cape Town"
      }
    },
    {
      rating: 5,
      text: "As a recent graduate with limited experience, I was struggling to get noticed. ATSBoost helped me highlight my skills and qualifications correctly. I now have a job at a top engineering firm!",
      author: {
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100",
        name: "David N.",
        title: "Graduate Engineer, Durban"
      }
    }
  ];

  // Helper function to render rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="text-yellow-400 fill-current h-4 w-4" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="text-yellow-400 fill-current h-4 w-4" />);
    }

    return stars;
  };

  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div 
            className="cursor-pointer flex items-center justify-center gap-3 hover:bg-gray-50 rounded-lg p-4 transition-colors duration-200"
            onClick={() => setSectionOpen(!sectionOpen)}
          >
            <h2 className="text-3xl font-bold text-secondary">Success Stories</h2>
            {sectionOpen ? (
              <ChevronUp className="h-8 w-8 text-primary animate-bounce" />
            ) : (
              <ChevronDown className="h-8 w-8 text-primary animate-pulse" />
            )}
          </div>
          <p className="text-neutral-600 max-w-2xl mx-auto mt-2">
            See how ATSBoost has helped South African job seekers land interviews and secure jobs.
          </p>
        </div>
        
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            sectionOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in-up">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {renderRatingStars(testimonial.rating)}
                  </div>
                  <span className="ml-2 text-neutral-600">{testimonial.rating.toFixed(1)}</span>
                </div>
                <p className="text-neutral-700 mb-4">{testimonial.text}</p>
                <div>
                  <div className="font-semibold">{testimonial.author.name}</div>
                  <div className="text-sm text-neutral-600">{testimonial.author.title}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/auth">
              <Button className="bg-primary text-white hover:bg-opacity-90 transform hover:scale-105 transition-transform duration-200">
                Join Them Today
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
