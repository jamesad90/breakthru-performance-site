import React from 'react';
import { Zap } from 'lucide-react';
import CenteredSVG from '@/public/images/logo/bolt_icon';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-500 py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
        <div className="w-20 h-20 bg-[#FF7F5C] rounded-full flex items-center justify-center">
          <CenteredSVG />
          </div>
          <h1 className="text-4xl font-bold text-white">Breakthru Testing</h1>
        </div>
        <p className="text-center text-blue-100 mt-4 text-lg">
          Book Your Performance Testing Session
        </p>
      </div>
    </header>
  );
}