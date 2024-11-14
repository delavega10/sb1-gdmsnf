export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'tourist' | 'host';
  bio?: string;
  location?: string;
  languages?: string[];
  interests?: string[];
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  duration: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  eventDates: string[];
  maxParticipants: number;
  bookedParticipants: { [date: string]: number };
  host: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  category: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  experienceId: string;
  userId: string;
  date: string;
  numberOfGuests: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId?: string;
  experienceId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}