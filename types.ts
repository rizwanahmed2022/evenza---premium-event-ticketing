
export type UserRole = 'attendee' | 'organizer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  imageUrl: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  organizerId: string;
  createdAt: any;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventTitle: string;
  eventDate: string;
  status: 'valid' | 'used' | 'cancelled';
  qrCode: string;
  bookedAt: any;
}
