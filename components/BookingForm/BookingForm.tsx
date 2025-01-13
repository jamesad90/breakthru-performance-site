import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  testType: string;
  date: string;
  time: string;
  sport: string;
  experience: string;
  location: string;
  address: string;
  message: string;
}

interface BookingFormProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedTest: { name: string; price: number } | null;
}

export default function BookingForm({ formData, onChange, onSubmit, selectedTest }: BookingFormProps) {
  const showAddressField = formData.location === 'home';

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Your Session</h2>
      
      {selectedTest ? (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">Selected Test: {selectedTest.name}</p>
          <p className="text-blue-600">Price: £{selectedTest.price}</p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">Please select a test type above to continue</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Test Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Sport</label>
            <input
              type="text"
              name="sport"
              value={formData.sport}
              onChange={onChange}
              placeholder="e.g., Triathlon, Cycling, Running"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select
              name="experience"
              value={formData.experience}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="elite">Elite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Location Preference */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Testing Location</label>
        <div className="grid md:grid-cols-2 gap-4">
          <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors
            ${formData.location === 'lab' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
            <input
              type="radio"
              name="location"
              value="lab"
              checked={formData.location === 'lab'}
              onChange={onChange}
              className="hidden"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800">Lab Testing</div>
              <div className="text-sm text-gray-600">Visit our fully equipped testing facility</div>
            </div>
          </label>
          
          <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors
            ${formData.location === 'home' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
            <input
              type="radio"
              name="location"
              value="home"
              checked={formData.location === 'home'}
              onChange={onChange}
              className="hidden"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800">At-Home Testing</div>
              <div className="text-sm text-gray-600">We come to you with our mobile testing equipment</div>
            </div>
          </label>
        </div>
      </div>

      {/* Conditional Address Field */}
      {showAddressField && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Testing Address
            <span className="text-gray-500 text-sm ml-1">(for at-home testing)</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={onChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Please provide your complete address including postcode"
            required={showAddressField}
          />
        </div>
      )}

      {/* Message */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={onChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any specific questions or concerns?"
        />
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={!selectedTest}
          className={`w-full py-3 px-6 rounded-md font-semibold flex items-center justify-center
            ${selectedTest 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 cursor-not-allowed text-gray-500'
            } transition-colors`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          {selectedTest ? 'Book Your Session' : 'Select a Test to Continue'}
        </button>
      </div>
    </form>
  );
}