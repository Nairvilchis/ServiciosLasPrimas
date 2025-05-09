import type React from 'react';

// Type for a service offered
export interface Service {
  id: string; // Unique identifier
  title: string;
  description: string;
  iconName: LucideIconName; // Name of the lucide-react icon
  image: string; // URL for the service image
  aiHint: string; // Hint for AI image generation/search
}

// Type for a photo in the gallery
export interface GalleryPhoto {
  id: string; // Unique identifier
  src: string; // URL for the photo
  alt: string;
  aiHint: string; // Hint for AI image generation/search
}

// Placeholder type for Lucide icon names.
export type LucideIconName = string;

// Type for a calendar event
export interface CalendarEvent {
  id: string; // Unique identifier
  title: string;
  startDateTime: Date;
  endDateTime?: Date; // Optional end date/time
  description?: string;
  clientName?: string;
  clientContact?: string;
  servicesInvolved?: string[]; // Array of service titles or IDs
  allDay?: boolean;
}

// Type for a quote submission
export interface Quote {
  id: string; // Unique identifier
  name: string;
  email: string;
  phone?: string;
  eventDate?: string; // Kept as string for simplicity, can be Date in DB
  services: string[]; // Array of service IDs (or titles if preferred)
  otherServiceDetail?: string; // For "Otro" service specification
  message: string;
  submissionDate: Date;
  status: 'new' | 'contacted' | 'closed'; // Status of the quote
}

// Type for Site Settings / Contact Information
export interface SiteSetting {
  id: string; // Should be a single, known ID e.g., "default-settings"
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  copyrightText?: string;
}

// Type for a budget item
export interface BudgetItem {
  id: string; // Can be a temporary client-side ID or MongoDB ObjectId string
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Type for a budget
export interface Budget {
  id: string; // Unique identifier from MongoDB
  clientName: string;
  clientContact?: string;
  eventDate: Date; // Store as Date in DB
  eventLocation?: string;
  eventDescription?: string;
  items: BudgetItem[];
  total: number;
  notes?: string;
  createdAt: Date; // Timestamp for when it was created
}

// Type for a purchase/expense
export interface Purchase {
  id: string; // Unique identifier from MongoDB
  date: Date;
  description: string;
  amount: number;
  purchaserName?: string; // Optional, who made the purchase
  createdAt: Date; // Timestamp for when it was created/recorded
}
