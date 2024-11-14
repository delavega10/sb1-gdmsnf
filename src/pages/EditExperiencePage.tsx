import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import ExperienceForm from '../components/ExperienceForm';
import type { Experience } from '../types';

export default function EditExperiencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function fetchExperience() {
      if (!id) return;

      try {
        const docRef = doc(db, 'experiences', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Experience;
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price.toString(),
            currency: data.currency,
            location: data.location,
            duration: data.duration,
            category: data.category,
            imageUrl: data.imageUrl,
            maxParticipants: data.maxParticipants.toString(),
            eventDates: data.eventDates.length > 0 ? data.eventDates : ['']
          });
        } else {
          console.error('Experience not found');
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error fetching experience:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExperience();
  }, [id, navigate]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to edit experiences</h1>
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
    if (!user || !id) return;

    setSaving(true);
    try {
      const experienceRef = doc(db, 'experiences', id);
      await updateDoc(experienceRef, {
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
        updatedAt: new Date().toISOString()
      });

      navigate(`/experience/${id}`);
    } catch (error) {
      console.error('Error updating experience:', error);
      alert('Failed to update experience. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Experience</h1>
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
        submitLabel="Save Changes"
      />
    </div>
  );
}