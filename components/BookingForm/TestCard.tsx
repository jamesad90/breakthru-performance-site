import React from 'react';
import { ChevronRight, LucideIcon, Check } from 'lucide-react';

interface TestCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: LucideIcon;
  features: string[];
  onClick: (id: string) => void;
  isSelected: boolean;
}

export default function TestCard({ 
  id, 
  name, 
  description, 
  price, 
  icon: Icon, 
  features, 
  onClick,
  isSelected 
}: TestCardProps) {
  return (
    <div 
      className={`bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer
        ${isSelected ? 'border-2 border-blue-500 ring-2 ring-blue-200' : 'border-2 border-transparent hover:border-blue-300'}`}
      onClick={() => onClick(id)}
      role="button"
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon className="w-8 h-8 text-orange-400 mr-3" />
          <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
        </div>
        {isSelected && (
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Selected
          </span>
        )}
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="text-sm text-gray-600 mb-4 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-blue-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-600">£{price}</span>
        <ChevronRight className="text-blue-500" />
      </div>
    </div>
  );
}