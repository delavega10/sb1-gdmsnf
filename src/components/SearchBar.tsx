import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';

export default function SearchBar() {
  const navigate = useNavigate();
  const { searchResults, loading, searchExperiences } = useSearch();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        searchExperiences(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, searchExperiences]);

  const handleResultClick = (experienceId: string) => {
    navigate(`/experience/${experienceId}`);
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="relative flex-1 max-w-lg mx-8" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder="Search by city, experience, or category..."
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-indigo-500"
        />
        {loading ? (
          <Loader2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 animate-spin" />
        ) : (
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        )}
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setShowResults(false);
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {showResults && searchTerm && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="divide-y">
              {searchResults.map((experience) => (
                <button
                  key={experience.id}
                  onClick={() => handleResultClick(experience.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-center space-x-4"
                >
                  <img
                    src={experience.imageUrl}
                    alt={experience.title}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/64?text=Experience';
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{experience.title}</h3>
                    <p className="text-sm text-gray-500">{experience.location}</p>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {experience.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No experiences found
            </div>
          )}
        </div>
      )}
    </div>
  );
}