'use client';
import React, { useState } from 'react';
import { Activity, Zap } from 'lucide-react';
import Header from '@/components/BookingForm/Header';
import TestCard from '@/components/BookingForm/TestCard';
import BookingForm from '@/components/BookingForm/BookingForm';
import Reports from '@/components/BookingForm/Reports';
import FAQ from '@/components/BookingForm/FAQ';
import Testimonials from '@/components/BookingForm/Testimonials';

const testTypes = [
  {
    id: 'metabolic',
    name: 'Metabolic Testing',
    description: 'VO2 Max & Metabolic Efficiency Analysis',
    price: 249,
    icon: Activity,
    features: [
      'VO2 Max Assessment',
      'Heart Rate Training Zones',
      'Metabolic Efficiency Analysis',
      'Personalized Training Recommendations'
    ]
  },
  {
    id: 'lactate',
    name: 'Lactate Testing',
    description: 'Blood Lactate Threshold Assessment',
    price: 199,
    icon: Zap,
    features: [
      'Lactate Threshold Determination',
      'Power/Pace Training Zones',
      'Endurance Performance Analysis',
      'Recovery Guidelines'
    ]
  }
];

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    testType: '',
    date: '',
    time: '',
    sport: '',
    experience: '',
    location: '',
    address: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTestSelect = (testId: string) => {
    setFormData({
      ...formData,
      testType: testId
    });
    // Smooth scroll to booking form
    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectedTest = testTypes.find(test => test.id === formData.testType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Test Types */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {testTypes.map((test) => (
            <TestCard
              key={test.id}
              {...test}
              onClick={handleTestSelect}
              isSelected={test.id === formData.testType}
            />
          ))}
        </div>

        {/* Booking Form */}
        <BookingForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          selectedTest={selectedTest || null}
        />

        {/* Reports Section */}
        <Reports />

        {/* Testimonials */}
        <Testimonials />

        {/* FAQ Section */}
        <FAQ />

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help? Contact us at{' '}
            <a href="mailto:info@breakthru.com" className="text-blue-600 hover:text-blue-700">
              info@breakthru.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;