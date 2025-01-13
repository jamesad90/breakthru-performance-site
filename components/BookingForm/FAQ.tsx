import React from 'react';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "What should I bring to my testing session?",
    answer: "For lab testing, bring your regular training gear, including shoes and comfortable clothing. For cyclists choosing at-home testing, ensure your bike is set up on your trainer. Stay hydrated and avoid heavy meals 2-3 hours before testing."
  },
  {
    question: "How long does a testing session take?",
    answer: "Metabolic testing sessions typically take 60-90 minutes, while lactate testing sessions usually last 45-60 minutes. This includes preparation, testing, and results discussion."
  },
  {
    question: "Do you offer at-home testing?",
    answer: "Yes! We provide mobile testing services where we bring our equipment to your location. This is perfect for cyclists who prefer to be tested on their own bike and trainer setup. Just select 'At-Home Testing' when booking."
  },
  {
    question: "How often should I get tested?",
    answer: "We recommend retesting every 3-6 months to track progress and adjust training zones, or at key points in your training cycle."
  },
  {
    question: "What will I learn from my test?",
    answer: "You'll receive detailed insights about your aerobic and anaerobic thresholds, training zones, and metabolic efficiency. We'll provide specific recommendations for training and nutrition."
  }
];

export default function FAQ() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-center mb-8">
          <HelpCircle className="w-8 h-8 text-blue-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}