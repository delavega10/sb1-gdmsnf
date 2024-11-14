import React, { useState } from 'react';
import { Star, Clock, MapPin, Calendar, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { Experience } from '../types';

interface ExperienceCardProps {
  experience: Experience;
  showEditControls?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ExperienceCard({ 
  experience,
  showEditControls = false,
  onEdit,
  onDelete 
}: ExperienceCardProps) {
  const navigate = useNavigate();
  const [showAllDates, setShowAllDates] = useState(false);
  
  const sortedDates = Array.isArray(experience.eventDates) ? 
    [...experience.eventDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) 
    : [];
  const displayDates = showAllDates ? sortedDates : sortedDates.slice(0, 2);

  const getAvailableSpots = (date: string) => {
    const booked = experience.bookedParticipants?.[date] || 0;
    return Math.max(0, experience.maxParticipants - booked);
  };

  const handleClick = () => {
    navigate(`/experience/${experience.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(experience.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this experience?')) {
      onDelete?.(experience.id);
    }
  };

  return (
    <div 
      onClick={handleClick} 
      className="group cursor-pointer transform transition-all duration-200 hover:-translate-y-1"
    >
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden">
        <div className="relative aspect-[4/3]">
          <img
            src={experience.imageUrl || 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'}
            alt={experience.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors">
            <svg
              className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{experience.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{experience.rating}</span>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-1 text-gray-500 text-sm mb-2">
            <MapPin className="w-4 h-4" />
            <span>{experience.location}</span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {experience.title}
          </h3>

          {sortedDates.length > 0 && (
            <div className="mb-3 bg-gray-50 rounded-lg p-2">
              <div className="flex items-center space-x-1 text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Available Dates</span>
              </div>
              <div className="space-y-1.5">
                {displayDates.map((date) => {
                  const availableSpots = getAvailableSpots(date);
                  return (
                    <div key={date} className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {new Date(date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        {availableSpots === 0 ? (
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            Sold Out
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {availableSpots} spots left
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {sortedDates.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowAllDates(!showAllDates);
                    }}
                    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    <span>{showAllDates ? 'Show less' : `+${sortedDates.length - 2} more dates`}</span>
                    {showAllDates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Link
              to={`/host/${experience.host.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/host/${experience.host.id}`);
              }}
              className="flex items-center space-x-2 hover:text-indigo-600"
            >
              {experience.host.avatar ? (
                <img
                  src={experience.host.avatar}
                  alt={experience.host.name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(experience.host.name)}&background=random`;
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-500">
                    {experience.host.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600 hover:text-indigo-600">
                by {experience.host.name}
              </span>
            </Link>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">
                {experience.currency}{experience.price}
              </span>
              <span className="text-sm text-gray-500"> / person</span>
            </div>
          </div>

          {showEditControls && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}