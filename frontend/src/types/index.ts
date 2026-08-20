// Shared TypeScript types — used by both pages and API layer

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  role: 'USER' | 'ADMIN';
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
}

export interface EventCategory {
  id: string;
  name: string;
  icon?: string;
  order: number;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;          // ISO date string
  startTime: string;     // "HH:MM"
  endTime?: string;
  address: string;
  mapsUrl?: string;
  latitude: number;
  longitude: number;
  contactNumber?: string;
  imageUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  maxAttendees?: number;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  rsvpCount: number;
  hostId: string;
  host: Pick<User, 'id' | 'name' | 'profileImage'>;
  category: EventCategory;
  createdAt: string;
  updatedAt: string;
  // Computed by API when user is authenticated
  hasRsvped?: boolean;
  hasBookmarked?: boolean;
  distanceKm?: number;
}

export interface Rsvp {
  id: string;
  eventId: string;
  userId: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  event?: Event;
}

export interface Bookmark {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
  event?: Event;
}

export interface Invitation {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  eventId: string;
  userId: string;
  invitedById: string;
  event: Event;
  createdAt: string;
}

export interface DirectoryUser {
  id: string;
  name: string;
  profileImage?: string;
}

export interface Notification {
  id: string;
  type: 'REMINDER_24H' | 'REMINDER_12H' | 'EVENT_CANCELLED' | 'RSVP_CONFIRMED' | 'EVENT_INVITATION' | 'INVITATION_ACCEPTED' | 'INVITATION_DECLINED';
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor: string;
  sentAt?: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  eventId: string;
  event?: Pick<Event, 'id' | 'slug' | 'title' | 'date'>;
  createdAt: string;
}

// API envelope
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth
export interface AuthTokenPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginResponse {
  token: string;
  user: User;
}
