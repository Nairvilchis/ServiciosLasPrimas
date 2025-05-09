

'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CalendarClock, ShoppingCart, FileText, PlusCircle, ListChecks, Edit, Trash2, Loader2, Eye } from 'lucide-react'; // Added Eye
import { useRouter } from 'next/navigation';
import { getCalendarEvents, getServices } from '@/services/eventData'; // Added getServices
import type { CalendarEvent, Service } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import EventFormModal from '@/components/admin/EventFormModal';
import { useToast } from '@/hooks/use-toast';
import { deleteCalendarEventAction } from '@/app/actions/eventActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table'; // Added TableHead
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { FormItem } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // Removed DialogTrigger, DialogClose
import { Badge } from '@/components/ui/badge'; // Added Badge for item display in dialog


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

  const [isClient, setIsClient] = useState(false);

  const [purchases, setPurchases] = useState<any[]>([]);
  const [nextPurchaseId, setNextPurchaseId] = useState(1);
  const [newPurchaseDate, setNewPurchaseDate] = useState('');
  const [newPurchaseDescription, setNewPurchaseDescription] = useState('');
  const [newPurchaseAmount, setNewPurchaseAmount] = useState('');
  const [newPurchaserName, setNewPurchaserName] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [purchaseToEdit, setPurchaseToEdit] = useState<any | null>(null);

  const [budgets, setBudgets] = useState<any[]>([]);
  const [nextBudgetId, setNextBudgetId] = useState(1);
  const [newBudgetClientName, setNewBudgetClientName] = useState('');
  const [newBudgetClientContact, setNewBudgetClientContact] = useState('');
  const [newBudgetEventDate, setNewBudgetEventDate] = useState('');
  const [newBudgetEventLocation, setNewBudgetEventLocation] = useState('');
  const [newBudgetEventDescription, setNewBudgetEventDescription] = useState('');
  const [newBudgetItems, setNewBudgetItems] = useState<Array<{ id: number; name: string; quantity: string; price: string; subtotal: number }>>([]);
  const [newBudgetItemName, setNewBudgetItemName] = useState('');
  const [newBudgetItemQuantity, setNewBudgetItemQuantity] = useState('');
  const [newBudgetItemPrice, setNewBudgetItemPrice] = useState('');
  const [newBudgetNotes, setNewBudgetNotes] = useState('');
  const [isEditBudgetMode, setIsEditBudgetMode] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<any | null>(null);
  const [nextBudgetItemId, setNextBudgetItemId] = useState(1);
  const [selectedBudgetDetails, setSelectedBudgetDetails] = useState<any | null>(null); // For budget details dialog

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
    setIsClient(true);
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
    fetchEvents();
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
        fetchEvents();
      } else {
        toast({ title: 'Error', description: result.message || 'Error al eliminar el evento.', variant: "destructive" });
      }
      setEventToDelete(null);
    });
  };

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchaseDate || !newPurchaseDescription || !newPurchaseAmount) {
        toast({ title: "Campos incompletos", description: "Por favor, completa fecha, descripción y monto.", variant: "destructive"});
        return;
    }
    if (isEditMode && purchaseToEdit) {
      setPurchases(purchases.map(p => p.id === purchaseToEdit.id ? { ...p, date: newPurchaseDate, description: newPurchaseDescription, amount: parseFloat(newPurchaseAmount) || 0, purchaserName: newPurchaserName } : p));
      toast({title: "Éxito", description: "Compra actualizada."})
    } else {
      const newPurchase = {
        id: nextPurchaseId,
        date: newPurchaseDate,
        description: newPurchaseDescription,
        amount: parseFloat(newPurchaseAmount) || 0,
        purchaserName: newPurchaserName,
      };
      setPurchases([...purchases, newPurchase]);
      setNextPurchaseId(nextPurchaseId + 1);
      toast({title: "Éxito", description: "Compra agregada."})
    }
    setIsEditMode(false);
    setPurchaseToEdit(null);
    setNewPurchaseDate('');
    setNewPurchaseDescription('');
    setNewPurchaseAmount('');
    setNewPurchaserName('');
  };

  const handleEditPurchaseClick = (purchase: any) => {
    setIsEditMode(true);
    setPurchaseToEdit(purchase);
    setNewPurchaseDate(purchase.date);
    setNewPurchaseDescription(purchase.description);
    setNewPurchaseAmount(String(purchase.amount));
    setNewPurchaserName(purchase.purchaserName || '');
  };

  const handleDeletePurchase = (id: number) => {
    setPurchases(purchases.filter(p => p.id !== id));
    toast({title: "Éxito", description: "Compra eliminada."})
  };

  const calculateItemSubtotal = (priceStr: string, quantityStr: string) => {
    const price = parseFloat(priceStr);
    const quantity = parseInt(quantityStr, 10);
    if (isNaN(price) || isNaN(quantity)) return 0;
    return price * quantity;
  };

  const calculateBudgetTotal = (items: Array<{ subtotal: number }>) => {
    return items.reduce((total, item) => total + (item.subtotal || 0), 0);
  };

  const handleAddItemToBudget = () => {
    if (!newBudgetItemName || !newBudgetItemQuantity || !newBudgetItemPrice) {
        toast({ title: "Campos de ítem incompletos", description: "Por favor, completa nombre, cantidad y precio del ítem.", variant: "destructive"});
        return;
    }
    const newItem = {
      id: nextBudgetItemId,
      name: newBudgetItemName,
      quantity: newBudgetItemQuantity,
      price: newBudgetItemPrice,
      subtotal: calculateItemSubtotal(newBudgetItemPrice, newBudgetItemQuantity)
    };
    setNewBudgetItems([...newBudgetItems, newItem]);
    setNextBudgetItemId(nextBudgetItemId + 1);
    setNewBudgetItemName('');
    setNewBudgetItemQuantity('');
    setNewBudgetItemPrice('');
  };

  const handleRemoveBudgetItem = (itemId: number) => {
    setNewBudgetItems(newBudgetItems.filter(item => item.id !== itemId));
  };

  const resetBudgetForm = () => {
    setNewBudgetClientName('');
    setNewBudgetClientContact('');
    setNewBudgetEventDate('');
    setNewBudgetEventLocation('');
    setNewBudgetEventDescription('');
    setNewBudgetItems([]);
    setNewBudgetNotes('');
    setNextBudgetItemId(1); // Reset item ID counter for new budget
  }

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetClientName || !newBudgetEventDate) {
        toast({ title: "Campos de presupuesto incompletos", description: "Cliente y fecha del evento son requeridos.", variant: "destructive"});
        return;
    }
    const budgetData = {
      clientName: newBudgetClientName,
      clientContact: newBudgetClientContact,
      eventDate: newBudgetEventDate,
      eventLocation: newBudgetEventLocation,
      eventDescription: newBudgetEventDescription,
      items: newBudgetItems,
      total: calculateBudgetTotal(newBudgetItems),
      notes: newBudgetNotes,
      createdAt: new Date().toISOString()
    };

    if (isEditBudgetMode && budgetToEdit) {
      setBudgets(budgets.map(b => b.id === budgetToEdit.id ? { ...b, ...budgetData } : b));
      toast({title: "Éxito", description: "Presupuesto actualizado."})
    } else {
      setBudgets([...budgets, { id: nextBudgetId, ...budgetData }]);
      setNextBudgetId(nextBudgetId + 1);
      toast({title: "Éxito", description: "Presupuesto creado."})
    }
    setIsEditBudgetMode(false);
    setBudgetToEdit(null);
    resetBudgetForm();
  };

  const handleEditBudgetClick = (budget: any) => {
    setIsEditBudgetMode(true);
    setBudgetToEdit(budget);
    setNewBudgetClientName(budget.clientName);
    setNewBudgetClientContact(budget.clientContact || '');
    setNewBudgetEventDate(budget.eventDate);
    setNewBudgetEventLocation(budget.eventLocation || '');
    setNewBudgetEventDescription(budget.eventDescription || '');
    setNewBudgetItems(budget.items || []);
    setNewBudgetNotes(budget.notes || '');
    setNextBudgetItemId((budget.items?.length || 0) + 1); // Ensure item IDs are fresh
  };

  const handleDeleteBudget = (id: number) => {
    setBudgets(budgets.filter(b => b.id !== id));
    toast({title: "Éxito", description: "Presupuesto eliminado."})
  };

  const eventDates = React.useMemo(() => events.map(event => {
    const date = parseISO(event.startDateTime as unknown as string);
    return isValid(date) ? date : new Date(NaN); // Return invalid date if parse fails
  }).filter(date => isValid(date)), [events]);


  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
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
                      {isClient ? (
                         <Calendar
                            mode="single"
                            selected={selectedCalendarDate}
                            onSelect={setSelectedCalendarDate}
                            className="rounded-md border shadow"
                            locale={es}
                            modifiers={{ booked: eventDates }}
                            modifiersClassNames={{ booked: 'bg-primary/20 text-primary-foreground rounded-full' }}
                         />
                      ) : (
                        <Skeleton className="h-[290px] w-[280px] rounded-md" />
                      )}
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
                                          Inicio: {isValid(parseISO(event.startDateTime as unknown as string)) ? format(parseISO(event.startDateTime as unknown as string), "PPpp", { locale: es }) : 'Fecha inválida'}
                                          {event.endDateTime && isValid(parseISO(event.endDateTime as unknown as string)) && ` - Fin: ${format(parseISO(event.endDateTime as unknown as string), "PPpp", { locale: es })}`}
                                        </p>
                                        {event.clientName && <p className="text-sm text-muted-foreground">Cliente: {event.clientName}</p>}
                                        {event.description && <p className="text-xs text-muted-foreground mt-1 truncate">{event.description}</p>}
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(event)} title="Editar">
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(event)} disabled={isDeleting && eventToDelete?.id === event.id} title="Eliminar">
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
                 <CardContent className="space-y-4 p-6">
                  <form onSubmit={handleAddPurchase} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2">{isEditMode ? 'Editar Compra' : 'Agregar Nueva Compra'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem>
                            <Label htmlFor="purchaseDate">Fecha</Label>
                            <Input type="date" id="purchaseDate" value={newPurchaseDate} onChange={(e) => setNewPurchaseDate(e.target.value)} required />
                        </FormItem>
                        <FormItem>
                            <Label htmlFor="purchaserName">Comprador (Opcional)</Label>
                            <Input type="text" id="purchaserName" placeholder="Nombre del comprador" value={newPurchaserName} onChange={(e) => setNewPurchaserName(e.target.value)} />
                        </FormItem>
                    </div>
                    <FormItem>
                        <Label htmlFor="purchaseDescription">Descripción</Label>
                        <Textarea id="purchaseDescription" placeholder="Descripción de la compra" value={newPurchaseDescription} onChange={(e) => setNewPurchaseDescription(e.target.value)} required/>
                    </FormItem>
                    <FormItem>
                        <Label htmlFor="purchaseAmount">Monto</Label>
                        <Input type="number" id="purchaseAmount" placeholder="0.00" value={newPurchaseAmount} onChange={(e) => setNewPurchaseAmount(e.target.value)} step="0.01" required/>
                    </FormItem>
                    <Button type="submit" className="w-full md:w-auto">{isEditMode ? 'Actualizar Compra' : 'Agregar Compra'}</Button>
                    {isEditMode && <Button type="button" variant="outline" onClick={() => {setIsEditMode(false); setPurchaseToEdit(null); setNewPurchaseDate(''); setNewPurchaseDescription(''); setNewPurchaseAmount(''); setNewPurchaserName('');}} className="w-full md:w-auto ml-2">Cancelar Edición</Button>}
                  </form>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Historial de Compras</h3>
                  {purchases.length === 0 ? <p className="text-muted-foreground">No hay compras registradas.</p> : (
                  <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Comprador</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                      <TableBody>
                         {purchases.map((purchase) => (
                              <TableRow key={purchase.id}>
                                  <TableCell>{isValid(parseISO(purchase.date)) ? format(parseISO(purchase.date), "PP", { locale: es }) : 'Fecha Inválida'}</TableCell>
                                  <TableCell>{purchase.description}</TableCell>
                                  <TableCell>{purchase.purchaserName || '-'}</TableCell>
                                  <TableCell className="text-right">{purchase.amount.toLocaleString('es-ES', { style: 'currency', currency: 'MXN' })}</TableCell>
                                  <TableCell className="text-right">
                                       <div className="flex justify-end space-x-2">
                                          <Button variant="outline" size="sm" onClick={() => handleEditPurchaseClick(purchase)}><Edit className="h-3 w-3"/></Button>
                                          <Button variant="destructive" size="sm" onClick={() => handleDeletePurchase(purchase.id)}><Trash2 className="h-3 w-3"/></Button>
                                        </div>
                                  </TableCell>
                              </TableRow>
                          ))}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presupuestos">
              <Card className="border-destructive/50">
                  <CardHeader>
                      <CardTitle className="text-xl text-destructive-foreground">{isEditBudgetMode ? 'Editar Presupuesto' : 'Crear Nuevo Presupuesto'}</CardTitle>
                      <CardDescription>Genera presupuestos detallados para tus clientes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                      <form onSubmit={handleSaveBudget} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormItem><Label htmlFor="budgetClientName">Nombre del Cliente</Label><Input id="budgetClientName" value={newBudgetClientName} onChange={(e) => setNewBudgetClientName(e.target.value)} required /></FormItem>
                              <FormItem><Label htmlFor="budgetClientContact">Contacto (Tel/Email)</Label><Input id="budgetClientContact" value={newBudgetClientContact} onChange={(e) => setNewBudgetClientContact(e.target.value)} /></FormItem>
                              <FormItem><Label htmlFor="budgetEventDate">Fecha del Evento</Label><Input type="date" id="budgetEventDate" value={newBudgetEventDate} onChange={(e) => setNewBudgetEventDate(e.target.value)} required /></FormItem>
                              <FormItem><Label htmlFor="budgetEventLocation">Lugar del Evento</Label><Input id="budgetEventLocation" value={newBudgetEventLocation} onChange={(e) => setNewBudgetEventLocation(e.target.value)} /></FormItem>
                          </div>
                          <FormItem><Label htmlFor="budgetEventDescription">Descripción del Evento/Alcance</Label><Textarea id="budgetEventDescription" value={newBudgetEventDescription} onChange={(e) => setNewBudgetEventDescription(e.target.value)} /></FormItem>
                          
                          <h4 className="text-md font-semibold pt-2">Ítems del Presupuesto:</h4>
                          <div className="space-y-2">
                              {newBudgetItems.map(item => (
                                  <div key={item.id} className="flex items-center gap-2 p-2 border rounded-md">
                                      <span className="flex-grow">{item.name} (Cant: {item.quantity}, Precio: ${item.price}, Subtotal: ${item.subtotal.toFixed(2)})</span>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveBudgetItem(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                  </div>
                              ))}
                          </div>
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end p-2 border rounded-md">
                              <FormItem className="md:col-span-2"><Label htmlFor="budgetItemName">Nombre Ítem</Label><Input id="budgetItemName" value={newBudgetItemName} onChange={(e) => setNewBudgetItemName(e.target.value)} /></FormItem>
                              <FormItem><Label htmlFor="budgetItemQuantity">Cantidad</Label><Input type="number" id="budgetItemQuantity" value={newBudgetItemQuantity} onChange={(e) => setNewBudgetItemQuantity(e.target.value)} min="1" /></FormItem>
                              <FormItem><Label htmlFor="budgetItemPrice">Precio Unit.</Label><Input type="number" id="budgetItemPrice" value={newBudgetItemPrice} onChange={(e) => setNewBudgetItemPrice(e.target.value)} step="0.01" min="0"/></FormItem>
                              <Button type="button" onClick={handleAddItemToBudget} className="self-end">Añadir Ítem</Button>
                          </div>

                          <p className="text-lg font-semibold text-right mt-2">Total Presupuesto: {calculateBudgetTotal(newBudgetItems).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                          
                          <FormItem><Label htmlFor="budgetNotes">Notas Adicionales</Label><Textarea id="budgetNotes" value={newBudgetNotes} onChange={(e) => setNewBudgetNotes(e.target.value)} /></FormItem>
                          
                          <div className="flex justify-end space-x-2">
                            {isEditBudgetMode && <Button type="button" variant="outline" onClick={() => {setIsEditBudgetMode(false); setBudgetToEdit(null); resetBudgetForm();}}>Cancelar Edición</Button>}
                            <Button type="submit">{isEditBudgetMode ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}</Button>
                          </div>
                      </form>

                      <h3 className="text-lg font-semibold mt-8 mb-2">Presupuestos Guardados</h3>
                      {budgets.length === 0 ? <p className="text-muted-foreground">No hay presupuestos guardados.</p> : (
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Cliente</TableHead>
                                  <TableHead>Fecha Evento</TableHead>
                                  <TableHead className="hidden md:table-cell">Creado</TableHead>
                                  <TableHead className="text-right">Total</TableHead>
                                  <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {budgets.map(budget => (
                                  <TableRow key={budget.id}>
                                      <TableCell>{budget.clientName}</TableCell>
                                      <TableCell>{isValid(parseISO(budget.eventDate)) ? format(parseISO(budget.eventDate), "PP", { locale: es }) : 'Fecha Inválida'}</TableCell>
                                      <TableCell className="hidden md:table-cell">{isValid(parseISO(budget.createdAt)) ? format(parseISO(budget.createdAt), "PP", { locale: es }) : 'Fecha Inválida'}</TableCell>
                                      <TableCell className="text-right">{budget.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                      <TableCell className="text-right">
                                          <div className="flex justify-end space-x-1">
                                               <Button variant="ghost" size="sm" title="Ver Detalles" onClick={() => setSelectedBudgetDetails(budget)}>
                                                    <Eye className="h-4 w-4"/>
                                               </Button>
                                              <Button variant="outline" size="sm" onClick={() => handleEditBudgetClick(budget)} title="Editar"><Edit className="h-3 w-3"/></Button>
                                              <Button variant="destructive" size="sm" onClick={() => handleDeleteBudget(budget.id)} title="Eliminar"><Trash2 className="h-3 w-3"/></Button>
                                          </div>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                      )}
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

      <Dialog open={!!selectedBudgetDetails} onOpenChange={(isOpen) => { if (!isOpen) setSelectedBudgetDetails(null); }}>
       {selectedBudgetDetails && (
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Presupuesto</DialogTitle>
            <DialogDescription>
              Cliente: {selectedBudgetDetails.clientName} <br />
              Fecha Evento: {isValid(parseISO(selectedBudgetDetails.eventDate)) ? format(parseISO(selectedBudgetDetails.eventDate), "PPPP", { locale: es }) : 'Fecha Inválida'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            {selectedBudgetDetails.clientContact && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-semibold text-muted-foreground">Contacto:</span>
                <span>{selectedBudgetDetails.clientContact}</span>
              </div>
            )}
            {selectedBudgetDetails.eventLocation && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-semibold text-muted-foreground">Lugar:</span>
                <span>{selectedBudgetDetails.eventLocation}</span>
              </div>
            )}
            {selectedBudgetDetails.eventDescription && (
              <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <span className="font-semibold text-muted-foreground pt-1">Descripción:</span>
                <p className="bg-muted p-2 rounded-md whitespace-pre-wrap">{selectedBudgetDetails.eventDescription}</p>
              </div>
            )}
            <div className="grid grid-cols-[120px_1fr] items-start gap-2">
              <span className="font-semibold text-muted-foreground pt-1">Ítems:</span>
              <div className="space-y-1">
                {selectedBudgetDetails.items.map((item: any) => (
                  <Badge key={item.id} variant="secondary" className="mr-1 mb-1 text-xs p-1">
                    {item.name} (Cant: {item.quantity}, Precio: ${parseFloat(item.price).toFixed(2)}, Subt: ${item.subtotal.toFixed(2)})
                  </Badge>
                ))}
                 {selectedBudgetDetails.items.length === 0 && <span>No hay ítems.</span>}
              </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="font-semibold text-muted-foreground">Total:</span>
              <span className="font-bold">{selectedBudgetDetails.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
            </div>
            {selectedBudgetDetails.notes && (
              <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <span className="font-semibold text-muted-foreground pt-1">Notas:</span>
                <p className="bg-muted p-2 rounded-md whitespace-pre-wrap">{selectedBudgetDetails.notes}</p>
              </div>
            )}
             <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-semibold text-muted-foreground">Creado:</span>
                <span>{isValid(parseISO(selectedBudgetDetails.createdAt)) ? format(parseISO(selectedBudgetDetails.createdAt), "PPpp", { locale: es }) : 'Fecha Inválida'}</span>
              </div>
          </div>
          <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSelectedBudgetDetails(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>

    </div>
  );
}

