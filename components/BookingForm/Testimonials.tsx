import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Johnson",
    sport: "Triathlete",
    quote: "The metabolic testing gave me precise training zones that helped me achieve a new PR in my last Ironman.",
    rating: 5
  },
  {
    name: "Mike Thompson",
    sport: "Cyclist",
    quote: "Understanding my lactate threshold has transformed my training approach. Highly recommended!",
    rating: 5
  },
  {
    name: "Emma Davis",
    sport: "Marathon Runner",
    quote: "The team's expertise and detailed explanations helped me optimize my training for my upcoming marathon.",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-12 bg-blue-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-center mb-8">
          <Quote className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">What Athletes Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">{testimonial.name}</p>
                <p className="text-gray-500">{testimonial.sport}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}