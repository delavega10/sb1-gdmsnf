import { 
  Compass, 
  UtensilsCrossed, 
  Tent, 
  Bike, 
  Waves, 
  Camera, 
  Palette, 
  Wine 
} from 'lucide-react';

export const categories = [
  { icon: Compass, label: 'Adventure', id: 'adventure' },
  { icon: UtensilsCrossed, label: 'Food & Drink', id: 'food-drink' },
  { icon: Tent, label: 'Nature', id: 'nature' },
  { icon: Bike, label: 'Sports', id: 'sports' },
  { icon: Waves, label: 'Water', id: 'water' },
  { icon: Camera, label: 'Photography', id: 'photography' },
  { icon: Palette, label: 'Art & Culture', id: 'art-culture' },
  { icon: Wine, label: 'Nightlife', id: 'nightlife' }
] as const;

export type CategoryId = typeof categories[number]['id'];
export type CategoryLabel = typeof categories[number]['label'];

export const getCategoryById = (id: string) => {
  return categories.find(c => c.id === id);
};

export const getCategoryByLabel = (label: string) => {
  return categories.find(c => c.label === label);
};

export const categoryIdToLabel = (id: string): string => {
  return getCategoryById(id)?.label || '';
};

export const categoryLabelToId = (label: string): string => {
  return getCategoryByLabel(label)?.id || '';
};