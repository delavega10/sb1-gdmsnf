import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import ExperienceForm from '../components/ExperienceForm';
import type { Experience } from '../types';

export default function CreateExperiencePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    location: '',
    duration: '',
    category: '',
    imageUrl: '',
    maxParticipants: '',
    eventDates: ['']
  });

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to create experiences</h1>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...formData.eventDates];
    newDates[index] = value;
    setFormData(prev => ({
      ...prev,
      eventDates: newDates
    }));
  };

  const addDateField = () => {
    setFormData(prev => ({
      ...prev,
      eventDates: [...prev.eventDates, '']
    }));
  };

  const removeDateField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      eventDates: prev.eventDates.filter((_, i) => i !== index)
    }));
  };

  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const experienceData: Omit<Experience, 'id'> = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        currency: formData.currency,
        location: formData.location,
        duration: formData.duration,
        imageUrl: formData.imageUrl,
        category: formData.category,
        maxParticipants: Number(formData.maxParticipants),
        eventDates: formData.eventDates.filter(date => date),
        rating: 0,
        reviewCount: 0,
        bookedParticipants: {},
        host: {
          id: user.id,
          name: user.name,
          avatar: user.avatar || '',
          rating: 0
        },
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'experiences'), experienceData);
      navigate(`/experience/${docRef.id}`);
    } catch (error) {
      console.error('Error creating experience:', error);
      alert('Failed to create experience. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Experience</h1>
      <ExperienceForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onImageUploaded={handleImageUploaded}
        onDateChange={handleDateChange}
        onAddDate={addDateField}
        onRemoveDate={removeDateField}
        onCancel={() => navigate(-1)}
        saving={saving}
        submitLabel="Create Experience"
      />
    </div>
  );
}