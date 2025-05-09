// Indica que este archivo se ejecuta en el servidor. Esto es relevante en frameworks como Next.js para diferenciar entre código del cliente y del servidor.
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  addService,
  addPhoto,
  deleteService,
  updateService,
  deletePhoto,
  updatePhoto,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  addQuote,
  updateSiteSettings,
  addBudget,
  updateBudget,
  deleteBudget,
} from '@/services/eventData';
import type { Service, GalleryPhoto, CalendarEvent, Quote, SiteSetting, Budget, BudgetItem } from '@/lib/types';

// --- Zod Schemas for Input Validation ---

const ServiceInputSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  iconName: z.string().min(1, "Se requiere el nombre del ícono."), 
  image: z.string().url("La imagen debe ser una URL válida."),
  aiHint: z.string().optional().default(""),
});

const ServiceUpdateSchema = ServiceInputSchema.partial();

const PhotoInputSchema = z.object({
  src: z.string().url("La fuente debe ser una URL válida."),
  alt: z.string().min(3, "El texto alternativo debe tener al menos 3 caracteres."),
  aiHint: z.string().optional().default(""),
});

const PhotoUpdateSchema = PhotoInputSchema.partial();

// Base schema for CalendarEvent without refinement
const BaseCalendarEventInputSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  startDateTime: z.coerce.date({ required_error: "La fecha y hora de inicio son requeridas."}),
  endDateTime: z.coerce.date().optional().nullable(),
  description: z.string().optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  servicesInvolved: z.array(z.string()).optional(),
  allDay: z.boolean().optional().default(false),
});

// Full schema with refinement for creation
const CalendarEventInputSchema = BaseCalendarEventInputSchema.refine(data => {
    if (data.endDateTime && data.startDateTime && data.startDateTime > data.endDateTime) {
      return false;
    }
    return true;
  }, {
    message: "La fecha de finalización no puede ser anterior a la fecha de inicio.",
    path: ["endDateTime"],
});

// Update schema based on the partial base schema
const CalendarEventUpdateSchema = BaseCalendarEventInputSchema.partial();


const QuoteInputSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
  phone: z.string().optional(),
  eventDate: z.string().optional(),
  services: z.array(z.string()).min(1, { message: "Debes seleccionar al menos un servicio." }),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
  otherServiceDetail: z.string().optional(),
});

const SiteSettingsInputSchema = z.object({
  whatsappNumber: z.string().min(10, "El número de WhatsApp debe tener al menos 10 dígitos.").regex(/^\+?[1-9]\d{1,14}$/, "Número de WhatsApp inválido."),
  contactEmail: z.string().email("Correo electrónico de contacto inválido."),
  contactPhone: z.string().min(10, "El teléfono de contacto debe tener al menos 10 dígitos.").regex(/^\+?[1-9]\d{1,14}$/, "Teléfono de contacto inválido."),
  copyrightText: z.string().optional(),
});

// Zod Schemas for Budgets
const BudgetItemInputSchema = z.object({
  id: z.string(), // Client-side temp ID, validated as string
  name: z.string().min(1, "El nombre del ítem es requerido."),
  quantity: z.coerce.number().min(0.01, "La cantidad debe ser mayor que cero."),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  subtotal: z.coerce.number(), // This will be calculated server-side
});

const BudgetInputSchema = z.object({
  clientName: z.string().min(2, "El nombre del cliente es requerido."),
  clientContact: z.string().optional(),
  eventDate: z.coerce.date({ required_error: "La fecha del evento es requerida." }),
  eventLocation: z.string().optional(),
  eventDescription: z.string().optional(),
  items: z.array(BudgetItemInputSchema),
  total: z.coerce.number(), // This will be calculated server-side
  notes: z.string().optional(),
});

const BudgetUpdateSchema = BudgetInputSchema.partial();


// --- Server Actions ---

export async function addServiceAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = ServiceInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Servicio):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos.",
    };
  }

  try {
    const newService = await addService(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services'); 
    return { success: true, data: newService, message: "Servicio añadido con éxito." };
  } catch (error) {
    console.error("Error al añadir servicio:", error);
    return { success: false, message: "Error al añadir el servicio." };
  }
}

export async function updateServiceAction(id: string, formData: FormData) {
  if (!id) {
     return { success: false, message: "Se requiere el ID del servicio para actualizar." };
  }
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = ServiceUpdateSchema.safeParse(rawData);

   if (!validatedFields.success) {
     console.error("Error de Validación (Actualizar Servicio):", validatedFields.error.flatten().fieldErrors);
     return {
       success: false,
       errors: validatedFields.error.flatten().fieldErrors,
       message: "Validación fallida. Por favor, revisa los campos.",
     };
   }

   if (Object.keys(validatedFields.data).length === 0) {
        return { success: false, message: "No se enviaron cambios para actualizar." };
   }

  try {
    const updatedService = await updateService(id, validatedFields.data);
    if (!updatedService) {
        return { success: false, message: `Servicio con ID ${id} no encontrado.` };
    }
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services');
    revalidatePath(`/admin/edit-service/${id}`); 
    return { success: true, data: updatedService, message: "Servicio actualizado con éxito." };
  } catch (error) {
    console.error(`Error al actualizar servicio ${id}:`, error);
    return { success: false, message: "Error al actualizar el servicio." };
  }
}

export async function deleteServiceAction(id: string) {
   if (!id) {
     return { success: false, message: "Se requiere el ID del servicio para eliminar." };
   }
  try {
    const deleted = await deleteService(id);
    if (!deleted) {
       return { success: false, message: `Servicio con ID ${id} no encontrado o no se pudo eliminar.` };
    }
    revalidatePath('/');
    revalidatePath('/#services');
    revalidatePath('/admin/services');
    return { success: true, message: "Servicio eliminado con éxito." };
  } catch (error) {
    console.error(`Error al eliminar servicio ${id}:`, error);
    return { success: false, message: "Error al eliminar el servicio." };
  }
}


export async function addPhotoAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = PhotoInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Foto):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos.",
    };
  }

  try {
    const newPhoto = await addPhoto(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery'); 
    return { success: true, data: newPhoto, message: "Foto añadida con éxito." };
  } catch (error) {
    console.error("Error al añadir foto:", error);
     const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { success: false, message: `Error al añadir la foto: ${errorMessage}` };
  }
}


export async function updatePhotoAction(id: string, formData: FormData) {
  if (!id) {
     return { success: false, message: "Se requiere el ID de la foto para actualizar." };
  }
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = PhotoUpdateSchema.safeParse(rawData);

   if (!validatedFields.success) {
     console.error("Error de Validación (Actualizar Foto):", validatedFields.error.flatten().fieldErrors);
     return {
       success: false,
       errors: validatedFields.error.flatten().fieldErrors,
       message: "Validación fallida. Por favor, revisa los campos.",
     };
   }

   if (Object.keys(validatedFields.data).length === 0) {
        return { success: false, message: "No se enviaron cambios para actualizar." };
   }

  try {
    const updatedPhoto = await updatePhoto(id, validatedFields.data);
     if (!updatedPhoto) {
        return { success: false, message: `Foto con ID ${id} no encontrada.` };
     }
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery');
    revalidatePath(`/admin/edit-photo/${id}`); 
    return { success: true, data: updatedPhoto, message: "Foto actualizada con éxito." };
  } catch (error) {
    console.error(`Error al actualizar foto ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { success: false, message: `Error al actualizar la foto: ${errorMessage}` };
  }
}

export async function deletePhotoAction(id: string) {
  if (!id) {
    return { success: false, message: "Se requiere el ID de la foto para eliminar." };
  }
  try {
    const deleted = await deletePhoto(id);
    if (!deleted) {
       return { success: false, message: `Foto con ID ${id} no encontrada o no se pudo eliminar.` };
    }
    revalidatePath('/');
    revalidatePath('/#gallery');
    revalidatePath('/admin/gallery');
    return { success: true, message: "Foto eliminada con éxito." };
  } catch (error) {
    console.error(`Error al eliminar foto ${id}:`, error);
    return { success: false, message: "Error al eliminar la foto." };
  }
}

// --- Server Actions for Calendar Events ---
export async function addCalendarEventAction(formData: FormData) {
  const rawData = {
    title: formData.get('title'),
    startDateTime: formData.get('startDateTime'),
    endDateTime: formData.get('endDateTime') || undefined, 
    description: formData.get('description') || undefined,
    clientName: formData.get('clientName') || undefined,
    clientContact: formData.get('clientContact') || undefined,
    servicesInvolved: formData.getAll('servicesInvolved').filter(Boolean), 
    allDay: formData.get('allDay') === 'on' || formData.get('allDay') === 'true',
  };

  const validatedFields = CalendarEventInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Evento):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos del evento.",
    };
  }

  try {
    const newEvent = await addCalendarEvent(validatedFields.data);
    revalidatePath('/admin/agenda');
    revalidatePath('/admin/quotes'); 
    return { success: true, data: newEvent, message: "Evento añadido con éxito." };
  } catch (error) {
    console.error("Error al añadir evento:", error);
    return { success: false, message: "Error al añadir el evento." };
  }
}

export async function updateCalendarEventAction(id: string, formData: FormData) {
  if (!id) {
    return { success: false, message: "Se requiere el ID del evento para actualizar." };
  }
 const rawData = {
    title: formData.get('title'),
    startDateTime: formData.get('startDateTime'),
    endDateTime: formData.get('endDateTime') || undefined,
    description: formData.get('description') || undefined,
    clientName: formData.get('clientName') || undefined,
    clientContact: formData.get('clientContact') || undefined,
    servicesInvolved: formData.getAll('servicesInvolved').filter(Boolean),
    allDay: formData.get('allDay') === 'on' || formData.get('allDay') === 'true',
  };

  const updateData: any = {};
  if (rawData.title) updateData.title = rawData.title;
  if (rawData.startDateTime) updateData.startDateTime = rawData.startDateTime;
  if (rawData.endDateTime !== undefined) updateData.endDateTime = rawData.endDateTime; // Allow null/undefined for clearing
  if (rawData.description !== undefined) updateData.description = rawData.description;
  if (rawData.clientName !== undefined) updateData.clientName = rawData.clientName;
  if (rawData.clientContact !== undefined) updateData.clientContact = rawData.clientContact;
  if (rawData.servicesInvolved && rawData.servicesInvolved.length > 0) updateData.servicesInvolved = rawData.servicesInvolved; else updateData.servicesInvolved = [];
  if (formData.has('allDay')) updateData.allDay = rawData.allDay;


  const validatedFields = CalendarEventUpdateSchema.safeParse(updateData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Actualizar Evento):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos del evento.",
    };
  }
  if (Object.keys(validatedFields.data).length === 0) {
    return { success: false, message: "No se enviaron cambios para actualizar." };
  }

  // Additional check for startDateTime vs endDateTime if both are present in the update
  if (validatedFields.data.startDateTime && validatedFields.data.endDateTime && new Date(validatedFields.data.startDateTime) > new Date(validatedFields.data.endDateTime)) {
    return {
        success: false,
        errors: { endDateTime: ["La fecha de finalización no puede ser anterior a la fecha de inicio."] },
        message: "Validación fallida: La fecha de finalización es anterior a la fecha de inicio.",
    };
  }


  try {
    const updatedEvent = await updateCalendarEvent(id, validatedFields.data);
    if (!updatedEvent) {
      return { success: false, message: `Evento con ID ${id} no encontrado.` };
    }
    revalidatePath('/admin/agenda');
    return { success: true, data: updatedEvent, message: "Evento actualizado con éxito." };
  } catch (error) {
    console.error(`Error al actualizar evento ${id}:`, error);
    return { success: false, message: "Error al actualizar el evento." };
  }
}

export async function deleteCalendarEventAction(id: string) {
  if (!id) {
    return { success: false, message: "Se requiere el ID del evento para eliminar." };
  }
  try {
    const deleted = await deleteCalendarEvent(id);
    if (!deleted) {
      return { success: false, message: `Evento con ID ${id} no encontrado o no se pudo eliminar.` };
    }
    revalidatePath('/admin/agenda');
    return { success: true, message: "Evento eliminado con éxito." };
  } catch (error) {
    console.error(`Error al eliminar evento ${id}:`, error);
    return { success: false, message: "Error al eliminar el evento." };
  }
}

// --- Server Action for Quotes ---
export async function addQuoteAction(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string || undefined,
    eventDate: formData.get('eventDate') as string || undefined,
    services: formData.getAll('services') as string[],
    message: formData.get('message') as string,
    otherServiceDetail: formData.get('otherServiceDetail') as string || undefined,
  };

  const validatedFields = QuoteInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Cotización):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos de la cotización.",
    };
  }

  try {
    const newQuote = await addQuote(validatedFields.data);
    revalidatePath('/admin/quotes'); 
    return { success: true, data: newQuote, message: "Cotización enviada con éxito." };
  } catch (error) {
    console.error("Error al añadir cotización:", error);
    return { success: false, message: "Error al enviar la cotización." };
  }
}

// --- Server Action for Site Settings ---
export async function updateSiteSettingsAction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = SiteSettingsInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Configuración del Sitio):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos de configuración.",
    };
  }

  try {
    const updatedSettings = await updateSiteSettings(validatedFields.data);
    if (!updatedSettings) {
      return { success: false, message: "No se pudo actualizar la configuración del sitio." };
    }
    revalidatePath('/'); 
    revalidatePath('/admin/settings'); 
    return { success: true, data: updatedSettings, message: "Configuración del sitio actualizada con éxito." };
  } catch (error) {
    console.error("Error al actualizar la configuración del sitio:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { success: false, message: `Error al actualizar la configuración: ${errorMessage}` };
  }
}

// --- Server Actions for Budgets ---
function parseBudgetItemsFromFormData(formData: FormData): BudgetItem[] {
  const itemsMap: { [key: string]: Partial<BudgetItem> & { index: number } } = {};
  for (const [key, value] of formData.entries()) {
    const itemMatch = key.match(/^items\[(\d+)\]\[(id|name|quantity|price)\]$/);
    if (itemMatch) {
      const index = parseInt(itemMatch[1], 10);
      const field = itemMatch[2] as keyof Omit<BudgetItem, 'subtotal'>;
      if (!itemsMap[index]) itemsMap[index] = { index };
      if (field === 'quantity' || field === 'price') {
        itemsMap[index][field] = parseFloat(value as string) as any;
      } else {
        itemsMap[index][field] = value as any;
      }
    }
  }
  return Object.values(itemsMap)
    .sort((a,b) => a.index - b.index) // Ensure order
    .map(item => ({
      id: String(item.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2,7)}`), // Ensure ID, even if temporary
      name: String(item.name || ''),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      subtotal: Number(item.quantity || 0) * Number(item.price || 0),
  }));
}

export async function addBudgetAction(formData: FormData) {
  const items = parseBudgetItemsFromFormData(formData);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const rawData = {
    clientName: formData.get('clientName') as string,
    clientContact: formData.get('clientContact') as string || undefined,
    eventDate: formData.get('eventDate') as string, // Will be coerced by Zod
    eventLocation: formData.get('eventLocation') as string || undefined,
    eventDescription: formData.get('eventDescription') as string || undefined,
    items: items,
    total: total,
    notes: formData.get('notes') as string || undefined,
  };

  const validatedFields = BudgetInputSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Añadir Presupuesto):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos del presupuesto.",
    };
  }

  try {
    const newBudget = await addBudget(validatedFields.data as Omit<Budget, 'id' | 'createdAt'>);
    revalidatePath('/admin/agenda');
    return { success: true, data: newBudget, message: "Presupuesto añadido con éxito." };
  } catch (error) {
    console.error("Error al añadir presupuesto:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { success: false, message: `Error al añadir el presupuesto: ${errorMessage}` };
  }
}

export async function updateBudgetAction(id: string, formData: FormData) {
  if (!id) {
    return { success: false, message: "Se requiere el ID del presupuesto para actualizar." };
  }
  const items = parseBudgetItemsFromFormData(formData);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const rawData = {
    clientName: formData.get('clientName') as string,
    clientContact: formData.get('clientContact') as string || undefined,
    eventDate: formData.get('eventDate') as string,
    eventLocation: formData.get('eventLocation') as string || undefined,
    eventDescription: formData.get('eventDescription') as string || undefined,
    items: items,
    total: total,
    notes: formData.get('notes') as string || undefined,
  };

  const validatedFields = BudgetUpdateSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Error de Validación (Actualizar Presupuesto):", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validación fallida. Por favor, revisa los campos del presupuesto.",
    };
  }
  if (Object.keys(validatedFields.data).length === 0) {
    return { success: false, message: "No se enviaron cambios para actualizar." };
  }

  try {
    const updatedBudget = await updateBudget(id, validatedFields.data);
    if (!updatedBudget) {
      return { success: false, message: `Presupuesto con ID ${id} no encontrado.` };
    }
    revalidatePath('/admin/agenda');
    return { success: true, data: updatedBudget, message: "Presupuesto actualizado con éxito." };
  } catch (error) {
    console.error(`Error al actualizar presupuesto ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
    return { success: false, message: `Error al actualizar el presupuesto: ${errorMessage}` };
  }
}

export async function deleteBudgetAction(id: string) {
  if (!id) {
    return { success: false, message: "Se requiere el ID del presupuesto para eliminar." };
  }
  try {
    const deleted = await deleteBudget(id);
    if (!deleted) {
      return { success: false, message: `Presupuesto con ID ${id} no encontrado o no se pudo eliminar.` };
    }
    revalidatePath('/admin/agenda');
    return { success: true, message: "Presupuesto eliminado con éxito." };
  } catch (error) {
    console.error(`Error al eliminar presupuesto ${id}:`, error);
    return { success: false, message: "Error al eliminar el presupuesto." };
  }
}
