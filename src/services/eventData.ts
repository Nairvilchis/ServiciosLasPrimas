// Indica que este archivo se ejecuta en el servidor. Esto es relevante en frameworks como Next.js para diferenciar entre código del cliente y del servidor.
'use server';
import mongoose from 'mongoose';
// Importa la biblioteca Mongoose, que se utiliza para interactuar con MongoDB.

import type { Service, GalleryPhoto, CalendarEvent, Quote, SiteSetting, Budget, BudgetItem } from '@/lib/types'; // Added SiteSetting, Budget, BudgetItem
// Importa los tipos `Service` y `GalleryPhoto` desde el archivo de tipos. Esto asegura que los datos cumplan con las interfaces definidas.

import { connectDB } from '@/config/db';
// Importa la función `connectDB` desde el archivo de configuración de la base de base de datos. Esta función se encarga de establecer la conexión con MongoDB.

connectDB();
// Llama a la función `connectDB` para conectar a la base de datos MongoDB al cargar este archivo.

// --- Definición de Esquemas y Modelos ---
const serviceSchema = new mongoose.Schema<Service>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconName: { type: String, required: true },
  image: { type: String, required: true },
  aiHint: { type: String, required: false, default: '' },
});

const photoSchema = new mongoose.Schema<GalleryPhoto>({
  id: { type: String, required: true, unique: true },
  src: { type: String, required: true },
  alt: { type: String, required: true },
  aiHint: { type: String, required: false, default: '' },
});

const calendarEventSchema = new mongoose.Schema<CalendarEvent>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date },
  description: { type: String },
  clientName: { type: String },
  clientContact: { type: String },
  servicesInvolved: [{ type: String }],
  allDay: { type: Boolean, default: false },
});

const quoteSchema = new mongoose.Schema<Quote>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  eventDate: { type: String }, 
  services: [{ type: String, required: true }], 
  otherServiceDetail: { type: String },
  message: { type: String, required: true },
  submissionDate: { type: Date, default: Date.now, required: true },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new', required: true },
});

const siteSettingSchema = new mongoose.Schema<SiteSetting>({
  id: { type: String, required: true, unique: true, default: 'default-settings' }, 
  whatsappNumber: { type: String, required: true, default: '1234567890' },
  contactEmail: { type: String, required: true, default: 'cotizaciones@servicioslasprimas.shop' },
  contactPhone: { type: String, required: true, default: '+52 (999) 510-6213' },
  copyrightText: { type: String, default: `© ${new Date().getFullYear()} Servicios Las Primas. Todos los derechos reservados.`}
});

const budgetItemSchema = new mongoose.Schema<BudgetItem>({
  id: { type: String, required: true }, // Client-side temp ID, or could be ObjectId string if items are separate docs
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
}, { _id: false }); // No separate _id for subdocuments unless items are managed independently

const budgetSchema = new mongoose.Schema<Budget>({
  id: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  clientContact: { type: String },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String },
  eventDescription: { type: String },
  items: [budgetItemSchema],
  total: { type: Number, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now, required: true },
});


const ServiceModel = mongoose.models.Service || mongoose.model<Service>('Service', serviceSchema);
const PhotoModel = mongoose.models.GalleryPhoto || mongoose.model<GalleryPhoto>('GalleryPhoto', photoSchema);
const CalendarEventModel = mongoose.models.CalendarEvent || mongoose.model<CalendarEvent>('CalendarEvent', calendarEventSchema);
const QuoteModel = mongoose.models.Quote || mongoose.model<Quote>('Quote', quoteSchema);
const SiteSettingModel = mongoose.models.SiteSetting || mongoose.model<SiteSetting>('SiteSetting', siteSettingSchema);
const BudgetModel = mongoose.models.Budget || mongoose.model<Budget>('Budget', budgetSchema);


// --- Funciones de Servicio ---
export async function getServices(): Promise<Service[]> {
  const services = await ServiceModel.find().lean();
  const plainServices = JSON.parse(JSON.stringify(services));
  return plainServices as Service[];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const service = await ServiceModel.findOne({ id }).lean();
  const plainService = JSON.parse(JSON.stringify(service));
  return plainService as Service | null;
}

export async function addService(serviceData: Omit<Service, 'id'>): Promise<Service> {
  const newId = serviceData.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
  const newService = new ServiceModel({ ...serviceData, id: newId });
  await newService.save();
  const plainNewService = JSON.parse(JSON.stringify(newService));
  return plainNewService as Service;
}

export async function updateService(id: string, updateData: Partial<Omit<Service, 'id'>>): Promise<Service | null> {
  const updatedService = await ServiceModel.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  if (updatedService) {
    const plainUpdatedService = JSON.parse(JSON.stringify(updatedService));
     return plainUpdatedService as Service;
  }
  return null;
}

export async function deleteService(id: string): Promise<boolean> {
  const result = await ServiceModel.deleteOne({ id });
  return result.deletedCount > 0;
}

// --- Funciones de Fotos ---
export async function getPhotos(): Promise<GalleryPhoto[]> {
  const photos = await PhotoModel.find().lean();
  const plainPhotos = JSON.parse(JSON.stringify(photos));
  return plainPhotos as GalleryPhoto[];
}

export async function getPhotoById(id: string): Promise<GalleryPhoto | null> {
  const photo = await PhotoModel.findOne({ id }).lean();
  const plainPhoto = JSON.parse(JSON.stringify(photo));
  return plainPhoto as GalleryPhoto | null;
}

export async function addPhoto(photoData: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
  const newId = 'photo-' + Date.now();
  if (!photoData.src || typeof photoData.src !== 'string' || !photoData.src.startsWith('http')) {
    throw new Error('URL de origen de foto inválida proporcionada.');
  }
  const newPhoto = new PhotoModel({ ...photoData, id: newId });
  await newPhoto.save();
  const plainNewPhoto = JSON.parse(JSON.stringify(newPhoto));
  return plainNewPhoto as GalleryPhoto;
}

export async function updatePhoto(id: string, updateData: Partial<Omit<GalleryPhoto, 'id'>>): Promise<GalleryPhoto | null> {
  if (updateData.src && (typeof updateData.src !== 'string' || !updateData.src.startsWith('http'))) {
    throw new Error('URL de origen de foto inválida proporcionada para la actualización.');
  }
  const updatedPhoto = await PhotoModel.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  if (updatedPhoto) {
    const plainUpdatedPhoto = JSON.parse(JSON.stringify(updatedPhoto));
     return plainUpdatedPhoto as GalleryPhoto;
  }
  return null;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const result = await PhotoModel.deleteOne({ id });
  return result.deletedCount > 0;
}

// --- Funciones de Eventos del Calendario ---
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const events = await CalendarEventModel.find().sort({ startDateTime: 1 }).lean();
  return JSON.parse(JSON.stringify(events)) as CalendarEvent[];
}

export async function getCalendarEventById(id: string): Promise<CalendarEvent | null> {
  const event = await CalendarEventModel.findOne({ id }).lean();
  return JSON.parse(JSON.stringify(event)) as CalendarEvent | null;
}

export async function addCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
  const newId = 'event-' + Date.now();
  const newEvent = new CalendarEventModel({ ...eventData, id: newId });
  await newEvent.save();
  return JSON.parse(JSON.stringify(newEvent)) as CalendarEvent;
}

export async function updateCalendarEvent(id: string, updateData: Partial<Omit<CalendarEvent, 'id'>>): Promise<CalendarEvent | null> {
  const updatedEvent = await CalendarEventModel.findOneAndUpdate({ id }, updateData, { new: true }).lean();
  if (updatedEvent) {
    return JSON.parse(JSON.stringify(updatedEvent)) as CalendarEvent;
  }
  return null;
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const result = await CalendarEventModel.deleteOne({ id });
  return result.deletedCount > 0;
}

// --- Funciones de Cotizaciones (Quotes) ---
export async function addQuote(quoteData: Omit<Quote, 'id' | 'submissionDate' | 'status'>): Promise<Quote> {
  const newId = 'quote-' + Date.now();
  const newQuote = new QuoteModel({
    ...quoteData,
    id: newId,
    submissionDate: new Date(),
    status: 'new',
  });
  await newQuote.save();
  return JSON.parse(JSON.stringify(newQuote)) as Quote;
}

export async function getQuotes(): Promise<Quote[]> {
  const quotes = await QuoteModel.find().sort({ submissionDate: -1 }).lean(); 
  return JSON.parse(JSON.stringify(quotes)) as Quote[];
}

export async function updateQuoteStatus(id: string, status: 'new' | 'contacted' | 'closed'): Promise<Quote | null> {
  const updatedQuote = await QuoteModel.findOneAndUpdate({ id }, { status }, { new: true }).lean();
  if (updatedQuote) {
    return JSON.parse(JSON.stringify(updatedQuote)) as Quote;
  }
  return null;
}

// --- Funciones de Configuración del Sitio ---
const DEFAULT_SITE_SETTINGS_ID = 'default-settings';

export async function getSiteSettings(): Promise<SiteSetting> {
  let settings = await SiteSettingModel.findOne({ id: DEFAULT_SITE_SETTINGS_ID }).lean();
  if (!settings) {
    settings = new SiteSettingModel({
      id: DEFAULT_SITE_SETTINGS_ID,
      whatsappNumber: '521234567890', 
      contactEmail: 'contacto@servicioslasprimas.com',
      contactPhone: '+52 999 123 4567',
      copyrightText: `© ${new Date().getFullYear()} Servicios Las Primas. Todos los derechos reservados.`
    });
    await (settings as mongoose.Document).save(); 
  }
  const plainSettings = JSON.parse(JSON.stringify(settings));
  return plainSettings as SiteSetting;
}

export async function updateSiteSettings(updateData: Partial<Omit<SiteSetting, 'id'>>): Promise<SiteSetting | null> {
  const updatedSettings = await SiteSettingModel.findOneAndUpdate(
    { id: DEFAULT_SITE_SETTINGS_ID },
    { $set: updateData },
    { new: true, upsert: true, setDefaultsOnInsert: true } 
  ).lean();

  if (updatedSettings) {
    const plainUpdatedSettings = JSON.parse(JSON.stringify(updatedSettings));
    return plainUpdatedSettings as SiteSetting;
  }
  return null;
}

// --- Funciones de Presupuestos (Budgets) ---
export async function getBudgets(): Promise<Budget[]> {
  const budgets = await BudgetModel.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(budgets)) as Budget[];
}

export async function getBudgetById(id: string): Promise<Budget | null> {
  const budget = await BudgetModel.findOne({ id }).lean();
  return JSON.parse(JSON.stringify(budget)) as Budget | null;
}

export async function addBudget(budgetData: Omit<Budget, 'id' | 'createdAt'>): Promise<Budget> {
  const newId = 'budget-' + Date.now();
  // Ensure items have string IDs if they don't already, or generate them
  const itemsWithIds = budgetData.items.map(item => ({
    ...item,
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  }));

  const newBudget = new BudgetModel({
    ...budgetData,
    items: itemsWithIds,
    id: newId,
    createdAt: new Date(),
  });
  await newBudget.save();
  console.log('Presupuesto Añadido:', newBudget);
  return JSON.parse(JSON.stringify(newBudget)) as Budget;
}

export async function updateBudget(id: string, updateData: Partial<Omit<Budget, 'id' | 'createdAt'>>): Promise<Budget | null> {
   // Ensure items in updateData also have string IDs
   if (updateData.items) {
    updateData.items = updateData.items.map(item => ({
      ...item,
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    }));
  }
  const updatedBudget = await BudgetModel.findOneAndUpdate({ id }, { ...updateData, createdAt: new Date() }, { new: true }).lean();
  if (updatedBudget) {
    console.log('Presupuesto Actualizado:', updatedBudget);
    return JSON.parse(JSON.stringify(updatedBudget)) as Budget;
  }
  return null;
}

export async function deleteBudget(id: string): Promise<boolean> {
  const result = await BudgetModel.deleteOne({ id });
  if (result.deletedCount > 0) {
    console.log('Presupuesto Eliminado con ID:', id);
    return true;
  }
  return false;
}
