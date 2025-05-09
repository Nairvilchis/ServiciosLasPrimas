

'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CalendarClock, ShoppingCart, FileText, PlusCircle, Edit, Trash2, Loader2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCalendarEvents, getBudgets, getPurchases } from '@/services/eventData'; 
import type { CalendarEvent, Budget, BudgetItem, Purchase } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import EventFormModal from '@/components/admin/EventFormModal';
import { useToast } from '@/hooks/use-toast';
import { deleteCalendarEventAction, addBudgetAction, updateBudgetAction, deleteBudgetAction, addPurchaseAction, updatePurchaseAction, deletePurchaseAction } from '@/app/actions/eventActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { FormItem } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; 
import { Badge } from '@/components/ui/badge'; 


export default function AgendaFinanzasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isDeletingEvent, startEventDeleteTransition] = useTransition();
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());

  const [isClient, setIsClient] = useState(false);

  // Purchases state
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
  const [isSavingPurchase, startPurchaseSaveTransition] = useTransition();
  const [isDeletingPurchase, startPurchaseDeleteTransition] = useTransition();
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
  const [purchaseToEdit, setPurchaseToEdit] = useState<Purchase | null>(null);
  const [isEditPurchaseMode, setIsEditPurchaseMode] = useState(false);
  
  // Form fields for new/edit purchase
  const [newPurchaseDate, setNewPurchaseDate] = useState('');
  const [newPurchaseDescription, setNewPurchaseDescription] = useState('');
  const [newPurchaseAmount, setNewPurchaseAmount] = useState('');
  const [newPurchaserName, setNewPurchaserName] = useState('');


  // Budgets state and server interaction
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true);
  const [isSavingBudget, startBudgetSaveTransition] = useTransition();
  const [isDeletingBudget, startBudgetDeleteTransition] = useTransition();
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);


  const [newBudgetClientName, setNewBudgetClientName] = useState('');
  const [newBudgetClientContact, setNewBudgetClientContact] = useState('');
  const [newBudgetEventDate, setNewBudgetEventDate] = useState('');
  const [newBudgetEventLocation, setNewBudgetEventLocation] = useState('');
  const [newBudgetEventDescription, setNewBudgetEventDescription] = useState('');
  const [newBudgetItems, setNewBudgetItems] = useState<Array<Omit<BudgetItem, 'subtotal'>>>([
    // Ensure IDs are strings if passed to server action that expects string IDs
  ]);
  const [newBudgetItemName, setNewBudgetItemName] = useState('');
  const [newBudgetItemQuantity, setNewBudgetItemQuantity] = useState('');
  const [newBudgetItemPrice, setNewBudgetItemPrice] = useState('');
  const [newBudgetNotes, setNewBudgetNotes] = useState('');
  const [isEditBudgetMode, setIsEditBudgetMode] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [nextBudgetItemId, setNextBudgetItemId] = useState(0); // For client-side unique keying of new items
  const [selectedBudgetDetails, setSelectedBudgetDetails] = useState<Budget | null>(null); 


  const fetchAllData = async () => {
    setIsLoadingEvents(true);
    setIsLoadingBudgets(true);
    setIsLoadingPurchases(true);
    try {
      const [fetchedEvents, fetchedBudgets, fetchedPurchases] = await Promise.all([
        getCalendarEvents(),
        getBudgets(),
        getPurchases()
      ]);
      setEvents(fetchedEvents);
      setBudgets(fetchedBudgets);
      setPurchases(fetchedPurchases);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" });
    } finally {
      setIsLoadingEvents(false);
      setIsLoadingBudgets(false);
      setIsLoadingPurchases(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchAllData();
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
    fetchAllData(); 
  };

  const handleDeleteEventClick = (event: CalendarEvent) => {
    setEventToDelete(event);
  };

  const handleConfirmEventDelete = () => {
    if (!eventToDelete) return;
    startEventDeleteTransition(async () => {
      const result = await deleteCalendarEventAction(eventToDelete.id);
      if (result.success) {
        toast({ title: '¡Éxito!', description: result.message });
        fetchAllData();
      } else {
        toast({ title: 'Error', description: result.message || 'Error al eliminar el evento.', variant: "destructive" });
      }
      setEventToDelete(null);
    });
  };

  const resetPurchaseForm = () => {
    setNewPurchaseDate('');
    setNewPurchaseDescription('');
    setNewPurchaseAmount('');
    setNewPurchaserName('');
    setIsEditPurchaseMode(false);
    setPurchaseToEdit(null);
  }

  const handleAddOrUpdatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurchaseDate || !newPurchaseDescription || !newPurchaseAmount) {
        toast({ title: "Campos incompletos", description: "Por favor, completa fecha, descripción y monto.", variant: "destructive"});
        return;
    }

    const formData = new FormData();
    formData.append('date', newPurchaseDate);
    formData.append('description', newPurchaseDescription);
    formData.append('amount', newPurchaseAmount);
    if (newPurchaserName) formData.append('purchaserName', newPurchaserName);

    startPurchaseSaveTransition(async () => {
      const action = isEditPurchaseMode && purchaseToEdit
        ? updatePurchaseAction.bind(null, purchaseToEdit.id)
        : addPurchaseAction;
      
      const result = await action(formData);

      if (result.success) {
        toast({title: "Éxito", description: result.message});
        fetchAllData();
        resetPurchaseForm();
      } else {
        toast({title: "Error", description: result.message || "Error al guardar la compra.", variant: "destructive"});
         if (result.errors) {
           console.error("Errores de campo (compra):", result.errors);
         }
      }
    });
  };

  const handleEditPurchaseClick = (purchase: Purchase) => {
    setIsEditPurchaseMode(true);
    setPurchaseToEdit(purchase);
    setNewPurchaseDate(format(new Date(purchase.date), "yyyy-MM-dd"));
    setNewPurchaseDescription(purchase.description);
    setNewPurchaseAmount(String(purchase.amount));
    setNewPurchaserName(purchase.purchaserName || '');
  };

 const handleDeletePurchaseClick = (purchase: Purchase) => {
    setPurchaseToDelete(purchase);
  };

  const handleConfirmPurchaseDelete = () => {
    if (!purchaseToDelete) return;
    startPurchaseDeleteTransition(async () => {
      const result = await deletePurchaseAction(purchaseToDelete.id);
      if (result.success) {
        toast({ title: "Éxito", description: result.message });
        fetchAllData();
      } else {
        toast({ title: "Error", description: result.message || "Error al eliminar la compra.", variant: "destructive" });
      }
      setPurchaseToDelete(null);
    });
  };


  const calculateBudgetTotal = (items: Array<{ price: number; quantity: number }>) => {
    return items.reduce((total, item) => total + (item.price * item.quantity || 0), 0);
  };

  const handleAddItemToBudget = () => {
    if (!newBudgetItemName || !newBudgetItemQuantity || !newBudgetItemPrice) {
        toast({ title: "Campos de ítem incompletos", description: "Por favor, completa nombre, cantidad y precio del ítem.", variant: "destructive"});
        return;
    }
    const newItem = {
      id: `client-item-${nextBudgetItemId}`, // Temporary client-side ID
      name: newBudgetItemName,
      quantity: parseInt(newBudgetItemQuantity, 10) || 1,
      price: parseFloat(newBudgetItemPrice) || 0,
    };
    setNewBudgetItems([...newBudgetItems, newItem]);
    setNextBudgetItemId(prev => prev + 1);
    setNewBudgetItemName('');
    setNewBudgetItemQuantity('');
    setNewBudgetItemPrice('');
  };

  const handleRemoveBudgetItem = (itemId: string) => {
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
    setNextBudgetItemId(0); 
    setIsEditBudgetMode(false);
    setBudgetToEdit(null);
  }

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetClientName || !newBudgetEventDate || newBudgetItems.length === 0) {
        toast({ title: "Campos de presupuesto incompletos", description: "Cliente, fecha del evento y al menos un ítem son requeridos.", variant: "destructive"});
        return;
    }

    const formData = new FormData();
    formData.append('clientName', newBudgetClientName);
    formData.append('clientContact', newBudgetClientContact);
    formData.append('eventDate', newBudgetEventDate); // Will be parsed to Date by Zod
    formData.append('eventLocation', newBudgetEventLocation);
    formData.append('eventDescription', newBudgetEventDescription);
    formData.append('notes', newBudgetNotes);

    newBudgetItems.forEach((item, index) => {
      formData.append(`items[${index}][id]`, item.id);
      formData.append(`items[${index}][name]`, item.name);
      formData.append(`items[${index}][quantity]`, String(item.quantity));
      formData.append(`items[${index}][price]`, String(item.price));
    });
    
    startBudgetSaveTransition(async () => {
      const action = isEditBudgetMode && budgetToEdit ? updateBudgetAction.bind(null, budgetToEdit.id) : addBudgetAction;
      const result = await action(formData);

      if (result.success) {
        toast({title: "Éxito", description: result.message });
        fetchAllData(); 
        resetBudgetForm();
      } else {
        toast({title: "Error", description: result.message || "Error al guardar el presupuesto.", variant: "destructive"});
      }
    });
  };

  const handleEditBudgetClick = (budget: Budget) => {
    setIsEditBudgetMode(true);
    setBudgetToEdit(budget);
    setNewBudgetClientName(budget.clientName);
    setNewBudgetClientContact(budget.clientContact || '');
    setNewBudgetEventDate(format(new Date(budget.eventDate), "yyyy-MM-dd"));
    setNewBudgetEventLocation(budget.eventLocation || '');
    setNewBudgetEventDescription(budget.eventDescription || '');
    setNewBudgetItems(budget.items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })));
    setNewBudgetNotes(budget.notes || '');
    setNextBudgetItemId(budget.items.length); // Reset based on existing items for new temp IDs
  };

  const handleDeleteBudgetClick = (budget: Budget) => {
    setBudgetToDelete(budget);
  };

  const handleConfirmBudgetDelete = () => {
    if (!budgetToDelete) return;
    startBudgetDeleteTransition(async () => {
        const result = await deleteBudgetAction(budgetToDelete.id);
        if (result.success) {
            toast({title: "Éxito", description: result.message});
            fetchAllData();
        } else {
            toast({title: "Error", description: result.message || "Error al eliminar el presupuesto.", variant: "destructive"});
        }
        setBudgetToDelete(null);
    });
  };


  const eventDates = React.useMemo(() => events.map(event => {
    const date = parseISO(event.startDateTime as unknown as string);
    return isValid(date) ? date : new Date(NaN); 
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
                                          Inicio: {isValid(new Date(event.startDateTime)) ? format(new Date(event.startDateTime), "PPpp", { locale: es }) : 'Fecha inválida'}
                                          {event.endDateTime && isValid(new Date(event.endDateTime)) && ` - Fin: ${format(new Date(event.endDateTime), "PPpp", { locale: es })}`}
                                        </p>
                                        {event.clientName && <p className="text-sm text-muted-foreground">Cliente: {event.clientName}</p>}
                                        {event.description && <p className="text-xs text-muted-foreground mt-1 truncate">{event.description}</p>}
                                    </div>
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(event)} title="Editar">
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteEventClick(event)} disabled={isDeletingEvent && eventToDelete?.id === event.id} title="Eliminar">
                                             {isDeletingEvent && eventToDelete?.id === event.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <Trash2 className="h-3 w-3" />}
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
                  <form onSubmit={handleAddOrUpdatePurchase} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-2">{isEditPurchaseMode ? 'Editar Compra' : 'Agregar Nueva Compra'}</h3>
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
                    <Button type="submit" className="w-full md:w-auto" disabled={isSavingPurchase}>
                        {isSavingPurchase ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isEditPurchaseMode ? 'Actualizar Compra' : 'Agregar Compra'}
                    </Button>
                    {isEditPurchaseMode && <Button type="button" variant="outline" onClick={resetPurchaseForm} className="w-full md:w-auto ml-2">Cancelar Edición</Button>}
                  </form>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Historial de Compras</h3>
                  {isLoadingPurchases ? (
                    <div className="space-y-3">
                        <Skeleton className="h-12 w-full rounded-md" />
                        <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                  ) : purchases.length === 0 ? <p className="text-muted-foreground">No hay compras registradas.</p> : (
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
                                  <TableCell>{isValid(new Date(purchase.date)) ? format(new Date(purchase.date), "PP", { locale: es }) : 'Fecha Inválida'}</TableCell>
                                  <TableCell>{purchase.description}</TableCell>
                                  <TableCell>{purchase.purchaserName || '-'}</TableCell>
                                  <TableCell className="text-right">{purchase.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                  <TableCell className="text-right">
                                       <div className="flex justify-end space-x-2">
                                          <Button variant="outline" size="sm" onClick={() => handleEditPurchaseClick(purchase)} disabled={isSavingPurchase || isDeletingPurchase}><Edit className="h-3 w-3"/></Button>
                                          <Button variant="destructive" size="sm" onClick={() => handleDeletePurchaseClick(purchase)} disabled={isSavingPurchase || isDeletingPurchase}>
                                            {isDeletingPurchase && purchaseToDelete?.id === purchase.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <Trash2 className="h-3 w-3"/>}
                                          </Button>
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
                                      <span className="flex-grow">{item.name} (Cant: {item.quantity}, Precio: ${item.price.toFixed(2)}, Subtotal: ${(item.quantity * item.price).toFixed(2)})</span>
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

                          <p className="text-lg font-semibold text-right mt-2">Total Presupuesto: {calculateBudgetTotal(newBudgetItems.map(i=>({price: i.price, quantity: i.quantity}))).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>
                          
                          <FormItem><Label htmlFor="budgetNotes">Notas Adicionales</Label><Textarea id="budgetNotes" value={newBudgetNotes} onChange={(e) => setNewBudgetNotes(e.target.value)} /></FormItem>
                          
                          <div className="flex justify-end space-x-2">
                            {isEditBudgetMode && <Button type="button" variant="outline" onClick={resetBudgetForm}>Cancelar Edición</Button>}
                            <Button type="submit" disabled={isSavingBudget}>
                                {isSavingBudget && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditBudgetMode ? 'Actualizar Presupuesto' : 'Guardar Presupuesto'}
                            </Button>
                          </div>
                      </form>

                      <h3 className="text-lg font-semibold mt-8 mb-2">Presupuestos Guardados</h3>
                      {isLoadingBudgets ? (
                         <div className="space-y-3">
                            <Skeleton className="h-12 w-full rounded-md" />
                            <Skeleton className="h-12 w-full rounded-md" />
                         </div>
                      ) : budgets.length === 0 ? <p className="text-muted-foreground">No hay presupuestos guardados.</p> : (
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
                                      <TableCell>{isValid(new Date(budget.eventDate)) ? format(new Date(budget.eventDate), "PP", { locale: es }) : 'Fecha Inválida'}</TableCell>
                                      <TableCell className="hidden md:table-cell">{isValid(new Date(budget.createdAt)) ? format(new Date(budget.createdAt), "PP", { locale: es }) : 'Fecha Inválida'}</TableCell>
                                      <TableCell className="text-right">{budget.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</TableCell>
                                      <TableCell className="text-right">
                                          <div className="flex justify-end space-x-1">
                                               <Button variant="ghost" size="sm" title="Ver Detalles" onClick={() => setSelectedBudgetDetails(budget)}>
                                                    <Eye className="h-4 w-4"/>
                                               </Button>
                                              <Button variant="outline" size="sm" onClick={() => handleEditBudgetClick(budget)} title="Editar" disabled={isSavingBudget}><Edit className="h-3 w-3"/></Button>
                                              <Button variant="destructive" size="sm" onClick={() => handleDeleteBudgetClick(budget)} title="Eliminar" disabled={isDeletingBudget && budgetToDelete?.id === budget.id}>
                                                {isDeletingBudget && budgetToDelete?.id === budget.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3"/>}
                                               </Button>
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
            <AlertDialogCancel onClick={() => setEventToDelete(null)} disabled={isDeletingEvent}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEventDelete} disabled={isDeletingEvent} className="bg-destructive hover:bg-destructive/90">
              {isDeletingEvent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!budgetToDelete} onOpenChange={(open) => !open && setBudgetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el presupuesto para el cliente:
              <span className="font-semibold"> "{budgetToDelete?.clientName}"</span> del evento en fecha: <span className="font-semibold">{budgetToDelete?.eventDate ? format(new Date(budgetToDelete.eventDate), "PP", {locale: es}) : ''}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBudgetToDelete(null)} disabled={isDeletingBudget}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBudgetDelete} disabled={isDeletingBudget} className="bg-destructive hover:bg-destructive/90">
              {isDeletingBudget ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar Presupuesto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!purchaseToDelete} onOpenChange={(open) => !open && setPurchaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la compra:
              <span className="font-semibold"> "{purchaseToDelete?.description}"</span> del <span className="font-semibold">{purchaseToDelete?.date ? format(new Date(purchaseToDelete.date), "PP", {locale: es}) : ''}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPurchaseToDelete(null)} disabled={isDeletingPurchase}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchaseDelete} disabled={isDeletingPurchase} className="bg-destructive hover:bg-destructive/90">
              {isDeletingPurchase ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Eliminar Compra
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
              Fecha Evento: {isValid(new Date(selectedBudgetDetails.eventDate)) ? format(new Date(selectedBudgetDetails.eventDate), "PPPP", { locale: es }) : 'Fecha Inválida'}
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
                {selectedBudgetDetails.items.map((item: BudgetItem) => ( // Ensure BudgetItem type
                  <Badge key={item.id} variant="secondary" className="mr-1 mb-1 text-xs p-1">
                    {item.name} (Cant: {item.quantity}, Precio: ${item.price.toFixed(2)}, Subt: ${item.subtotal.toFixed(2)})
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
                <span>{isValid(new Date(selectedBudgetDetails.createdAt)) ? format(new Date(selectedBudgetDetails.createdAt), "PPpp", { locale: es }) : 'Fecha Inválida'}</span>
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
