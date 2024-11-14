import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { categories } from '../lib/categories';

export default function CategoryBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      // If clicking the active category, remove the filter
      navigate('/explore');
    } else {
      navigate(`/explore?category=${categoryId}`);
    }
  };

  return (
    <div className="w-full bg-white shadow-sm py-4 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide pb-2">
          {categories.map(({ icon: Icon, label, id }) => (
            <button
              key={id}
              onClick={() => handleCategoryClick(id)}
              className={`flex flex-col items-center min-w-fit group transition-transform hover:scale-105 ${
                activeCategory === id ? 'text-indigo-600' : ''
              }`}
            >
              <div className={`p-3 rounded-full transition-all duration-200 ${
                activeCategory === id 
                  ? 'bg-indigo-100 text-indigo-600 scale-110' 
                  : 'bg-gray-100 group-hover:bg-indigo-50 group-hover:text-indigo-600'
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`mt-1 text-sm font-medium ${
                activeCategory === id 
                  ? 'text-indigo-600' 
                  : 'text-gray-600 group-hover:text-indigo-600'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}