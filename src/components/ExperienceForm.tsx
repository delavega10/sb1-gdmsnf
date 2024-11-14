import React from 'react';
import { Clock, MapPin, DollarSign, Users } from 'lucide-react';
import { categories } from '../lib/categories';
import ImageUpload from './ImageUpload';

interface FormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  location: string;
  duration: string;
  category: string;
  imageUrl: string;
  maxParticipants: string;
  eventDates: string[];
}

interface ExperienceFormProps {
  formData: FormData;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUploaded: (url: string) => void;
  onDateChange: (index: number, value: string) => void;
  onAddDate: () => void;
  onRemoveDate: (index: number) => void;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}

export default function ExperienceForm({
  formData,
  onSubmit,
  onChange,
  onImageUploaded,
  onDateChange,
  onAddDate,
  onRemoveDate,
  onCancel,
  saving,
  submitLabel
}: ExperienceFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience Image
        </label>
        <ImageUpload
          onImageUploaded={onImageUploaded}
          currentImageUrl={formData.imageUrl}
          folder="experiences"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          placeholder="Give your experience a catchy title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          placeholder="Describe what participants will experience"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={onChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select a category</option>
            {categories.map(({ label }) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={onChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Where will this take place?"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={onChange}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="e.g., 2 hours"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price per Person
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={onChange}
              required
              min="0"
              step="0.01"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Participants
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={onChange}
              required
              min="1"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              placeholder="Maximum number of participants"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Available Dates
        </label>
        <div className="space-y-2">
          {formData.eventDates.map((date, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => onDateChange(index, e.target.value)}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onRemoveDate(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={onAddDate}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            + Add another date
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}