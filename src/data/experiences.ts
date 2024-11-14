import type { Experience } from '../types';

export const SAMPLE_EXPERIENCES: Experience[] = [
  {
    id: '1',
    title: 'Traditional Cooking Class with Local Chef',
    description: "Join our passionate local chef for an immersive cooking experience where you'll learn authentic recipes passed down through generations. Perfect for food enthusiasts of all skill levels, this hands-on class will teach you the secrets of local cuisine while enjoying great company and stories about our food culture.",
    price: 89,
    currency: '$',
    location: 'Barcelona, Spain',
    duration: '3 hours',
    imageUrl: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    rating: 4.9,
    reviewCount: 128,
    eventDates: [
      '2024-03-20',
      '2024-03-22',
      '2024-03-25',
      '2024-03-28'
    ],
    host: {
      id: 'host1',
      name: 'Maria G.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      rating: 4.9
    },
    category: 'Food & Drink',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Hidden Gems Photography Tour',
    description: "Explore the city's most photogenic hidden spots with a professional photographer. Perfect for both beginners and experienced photographers, you'll discover secret locations while learning composition techniques and the best camera settings for each situation.",
    price: 65,
    currency: '$',
    location: 'Paris, France',
    duration: '4 hours',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1373&q=80',
    rating: 4.8,
    reviewCount: 95,
    eventDates: [
      '2024-03-21',
      '2024-03-23',
      '2024-03-26',
      '2024-03-29'
    ],
    host: {
      id: 'host2',
      name: 'Jean P.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      rating: 4.8
    },
    category: 'Photography',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Mountain Biking Adventure',
    description: 'Experience an exhilarating mountain biking adventure through stunning trails with breathtaking views. Suitable for intermediate riders, this guided tour includes all necessary equipment and safety briefing. Discover hidden valleys and scenic viewpoints while getting your adrenaline fix.',
    price: 75,
    currency: '$',
    location: 'Queenstown, NZ',
    duration: '5 hours',
    imageUrl: 'https://images.unsplash.com/photo-1544191696-102ad3aaece9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    rating: 4.9,
    reviewCount: 156,
    eventDates: [
      '2024-03-22',
      '2024-03-24',
      '2024-03-27',
      '2024-03-30'
    ],
    host: {
      id: 'host3',
      name: 'Mike R.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
      rating: 4.9
    },
    category: 'Adventure',
    createdAt: new Date().toISOString()
  }
];