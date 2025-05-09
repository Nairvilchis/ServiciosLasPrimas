// src/components/admin/EventFormModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addCalendarEventAction, updateCalendarEventAction } from '@/app/actions/eventActions';
import type { CalendarEvent, Service } from '@/lib/types';
import { getServices } from '@/services/eventData';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';


// Zod schema for input validation
const CalendarEventFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  startDateTime: z.date({ required_error: "La fecha y hora de inicio son requeridas."}),
  endDateTime: z.date().optional().nullable(),
  description: z.string().optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  servicesInvolved: z.array(z.string()).optional(),
  allDay: z.boolean().optional().default(false),
}).refine(data => {
    if (data.endDateTime && data.startDateTime > data.endDateTime) {
      return false;
    }
    return true;
  }, {
    message: "La fecha de finalización no puede ser anterior a la fecha de inicio.",
    path: ["endDateTime"],
});


type CalendarEventFormData = z.infer<typeof CalendarEventFormSchema>;

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null; // For editing
  onEventSaved: () => void; // Callback to refresh event list
}

export default function EventFormModal({ isOpen, onClose, event, onEventSaved }: EventFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  const form = useForm<CalendarEventFormData>({
    resolver: zodResolver(CalendarEventFormSchema),
    defaultValues: {
      title: '',
      startDateTime: new Date(),
      endDateTime: undefined,
      description: '',
      clientName: '',
      clientContact: '',
      servicesInvolved: [],
      allDay: false,
    },
  });

  useEffect(() => {
    async function fetchServices() {
      try {
        const services = await getServices();
        setAvailableServices(services);
      } catch (error) {
        console.error("Error al cargar servicios para el formulario:", error);
      }
    }
    fetchServices();
  }, []);

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        startDateTime: event.startDateTime ? parseISO(event.startDateTime as unknown as string) : new Date(),
        endDateTime: event.endDateTime ? parseISO(event.endDateTime as unknown as string) : undefined,
        description: event.description || '',
        clientName: event.clientName || '',
        clientContact: event.clientContact || '',
        servicesInvolved: event.servicesInvolved || [],
        allDay: event.allDay || false,
      });
    } else {
      form.reset({
        title: '',
        startDateTime: new Date(),
        endDateTime: undefined,
        description: '',
        clientName: '',
        clientContact: '',
        servicesInvolved: [],
        allDay: false,
      });
    }
  }, [event, form, isOpen]); // Re-run when isOpen changes to reset form if it was closed and reopened

  async function onSubmit(values: CalendarEventFormData) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
        if (value instanceof Date) {
            formData.append(key, value.toISOString());
        } else if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item));
        } else if (typeof value === 'boolean') {
            formData.append(key, value.toString());
        } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
      }
    });


    try {
      const result = event?.id
        ? await updateCalendarEventAction(event.id, formData)
        : await addCalendarEventAction(formData);

      if (result.success) {
        toast({
          title: '¡Éxito!',
          description: result.message,
        });
        onEventSaved(); // Call a callback to refresh the list
        onClose();
      } else {
        toast({
          title: 'Error',
          description: result.message || "Error al guardar el evento.",
          variant: 'destructive',
        });
        if (result.errors) {
          console.error("Errores de campo:", result.errors);
        }
      }
    } catch (error) {
      console.error('Error de envío:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Evento' : 'Crear Nuevo Evento'}</DialogTitle>
          <DialogDescription>
            {event ? 'Modifica los detalles de tu evento.' : 'Completa la información para crear un nuevo evento en tu agenda.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Boda Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha y Hora de Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date)}
                          initialFocus
                          locale={es}
                        />
                         <div className="p-3 border-t border-border">
                            <Input
                                type="time"
                                value={field.value ? format(field.value, "HH:mm") : ""}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    const [hours, minutes] = time.split(':').map(Number);
                                    const newDate = field.value ? new Date(field.value) : new Date();
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    field.onChange(newDate);
                                }}
                            />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDateTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha y Hora de Fin (Opcional)</FormLabel>
                     <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={(date) => field.onChange(date)}
                          locale={es}
                        />
                        <div className="p-3 border-t border-border">
                            <Input
                                type="time"
                                value={field.value ? format(field.value, "HH:mm") : ""}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    const [hours, minutes] = time.split(':').map(Number);
                                    const newDate = field.value ? new Date(field.value) : new Date();
                                    newDate.setHours(hours);
                                    newDate.setMinutes(minutes);
                                    field.onChange(newDate);
                                }}
                            />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Todo el día</FormLabel>
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales sobre el evento..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Cliente (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto del Cliente (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono o email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Servicios Involucrados (Opcional)</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {availableServices.map((service) => (
                  <FormField
                    key={service.id}
                    control={form.control}
                    name="servicesInvolved"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(service.title)}
                            onCheckedChange={(checked) => {
                              const currentServices = field.value || [];
                              return checked
                                ? field.onChange([...currentServices, service.title])
                                : field.onChange(
                                    currentServices.filter(
                                      (value) => value !== service.title
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{service.title}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>


            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
                {event ? 'Guardar Cambios' : 'Crear Evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
