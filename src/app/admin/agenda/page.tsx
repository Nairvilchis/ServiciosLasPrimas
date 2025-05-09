
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CalendarClock, ShoppingCart, FileText, PlusCircle, ListChecks, Edit, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCalendarEvents } from '@/services/eventData';
import type { CalendarEvent } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import EventFormModal from '@/components/admin/EventFormModal'; // Import the modal
import { useToast } from '@/hooks/use-toast';
import { deleteCalendarEventAction } from '@/app/actions/eventActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar'; // Import ShadCN Calendar
import { Skeleton } from '@/components/ui/skeleton';


export default function AgendaFinanzasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());


  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const fetchedEvents = await getCalendarEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      toast({ title: "Error", description: "No se pudieron cargar los eventos.", variant: "destructive" });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenModal = (event?: CalendarEvent) => {
    setSelectedEvent(event || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleEventSaved = () => {
    fetchEvents(); // Refresh events list after saving
  };

  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    startDeleteTransition(async () => {
      const result = await deleteCalendarEventAction(eventToDelete.id);
      if (result.success) {
        toast({ title: '¡Éxito!', description: result.message });
        fetchEvents(); // Refresh list
      } else {
        toast({ title: 'Error', description: result.message || 'Error al eliminar el evento.', variant: 'destructive' });
      }
      setEventToDelete(null);
    });
  };

  const eventDates = React.useMemo(() => events.map(event => parseISO(event.startDateTime as unknown as string)), [events]);


  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl"> {/* Increased max-width for calendar */}
      <Button variant="outline" size="sm" onClick={() => router.push('/admin')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Panel de Administración
      </Button>

      <Card className="shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Agenda Personal y Finanzas</CardTitle>
          <CardDescription>Organiza tus citas, registra tus gastos y crea presupuestos para tus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agenda" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
              <TabsTrigger value="agenda" className="text-sm md:text-base">
                <CalendarClock className="mr-2 h-5 w-5" />
                Agenda de Servicios
              </TabsTrigger>
              <TabsTrigger value="compras" className="text-sm md:text-base">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Registro de Compras
              </TabsTrigger>
              <TabsTrigger value="presupuestos" className="text-sm md:text-base">
                <FileText className="mr-2 h-5 w-5" />
                Creación de Presupuestos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agenda">
              <Card className="border-secondary">
                <CardHeader>
                  <CardTitle className="text-xl text-secondary-foreground">Agenda de Servicios</CardTitle>
                  <CardDescription>Visualiza y gestiona tus citas y eventos programados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 md:p-6">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" className="border-secondary text-secondary-foreground hover:bg-secondary/10" onClick={() => handleOpenModal()}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crear Nuevo Evento
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 flex justify-center">
                       <Calendar
                          mode="single"
                          selected={selectedCalendarDate}
                          onSelect={setSelectedCalendarDate}
                          className="rounded-md border shadow"
                          locale={es}
                          modifiers={{ booked: eventDates }}
                          modifiersClassNames={{ booked: 'bg-primary/20 text-primary-foreground rounded-full' }}

                       />
                    </div>
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-3 text-secondary-foreground/90">Próximos Eventos:</h3>
                        {isLoadingEvents ? (
                             <div className="space-y-3">
                                <Skeleton className="h-20 w-full rounded-md" />
                                <Skeleton className="h-20 w-full rounded-md" />
                             </div>
                        ) : events.length === 0 ? (
                          <p className="text-center text-muted-foreground italic py-4">No hay eventos programados.</p>
                        ) : (
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {events.map(event => (
                              <div key={event.id} className="p-3 border border-secondary/30 rounded-md bg-secondary/5 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-secondary-foreground/80">{event.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                          Inicio: {format(parseISO(event.startDateTime as unknown as string), "PPpp", { locale: es })}
                                          {event.endDateTime && ` - Fin: ${format(parseISO(event.endDateTime as unknown as string), "PPpp", { locale: es })}`}
                                        </p>
                                        {event.clientName && <p className="text-sm text-muted-foreground">Cliente: {event.clientName}</p>}
                                        {event.description && <p className="text-xs text-muted-foreground mt-1 truncate">{event.description}</p>}
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(event)} title="Editar">
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(event)} disabled={isDeleting} title="Eliminar">
                                             {isDeleting && eventToDelete?.id === event.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <Trash2 className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>

                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compras">
              <Card className="border-accent">
                <CardHeader>
                  <CardTitle className="text-xl text-accent-foreground">Registro de Compras y Gastos</CardTitle>
                  <CardDescription>Lleva un control de todas las compras y gastos relacionados con tu negocio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6 min-h-[200px] flex items-center justify-center">
                   <p className="text-muted-foreground italic">
                    Registra aquí tus facturas, compras de material, y otros gastos operativos.
                    (Funcionalidad de tabla de gastos y formularios por implementar)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presupuestos">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-xl text-destructive-foreground">Creación de Presupuestos</CardTitle>
                  <CardDescription>Genera presupuestos detallados para tus clientes de forma rápida y sencilla.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6 min-h-[200px] flex items-center justify-center">
                   <p className="text-muted-foreground italic">
                    Crea, guarda y envía presupuestos personalizados para cada evento o servicio.
                    (Funcionalidad de generador de presupuestos por implementar)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isModalOpen && (
        <EventFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          event={selectedEvent}
          onEventSaved={handleEventSaved}
        />
      )}

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el evento:
              <span className="font-semibold"> "{eventToDelete?.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)} disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
