
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { getQuotes, updateQuoteStatus } from '@/services/eventData';
import type { Quote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Inbox, CheckCircle, PhoneOutgoing, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

export default function ManageQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isUpdatingStatus, startStatusUpdateTransition] = useTransition();
  const [selectedQuoteDetails, setSelectedQuoteDetails] = useState<Quote | null>(null);

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const fetchedQuotes = await getQuotes();
      setQuotes(fetchedQuotes);
      setError(null);
    } catch (err) {
      console.error("Error al cargar cotizaciones:", err);
      setError("No se pudieron cargar las cotizaciones. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleStatusChange = async (quoteId: string, newStatus: 'new' | 'contacted' | 'closed') => {
    startStatusUpdateTransition(async () => {
      try {
        const updatedQuote = await updateQuoteStatus(quoteId, newStatus);
        if (updatedQuote) {
          setQuotes(prevQuotes =>
            prevQuotes.map(q => (q.id === quoteId ? updatedQuote : q))
          );
          toast({ title: 'Éxito', description: 'Estado de la cotización actualizado.' });
        } else {
          toast({ title: 'Error', description: 'No se pudo actualizar el estado.', variant: 'destructive' });
        }
      } catch (error) {
        console.error("Error al actualizar estado:", error);
        toast({ title: 'Error', description: 'Ocurrió un error al actualizar el estado.', variant: 'destructive' });
      }
    });
  };

  const getStatusVariant = (status: 'new' | 'contacted' | 'closed'): "default" | "secondary" | "outline" => {
    switch (status) {
      case 'new':
        return 'default'; // Primary color
      case 'contacted':
        return 'secondary'; // Secondary color
      case 'closed':
        return 'outline'; // More subdued
      default:
        return 'default';
    }
  };
  const getStatusText = (status: 'new' | 'contacted' | 'closed'): string => {
    switch (status) {
        case 'new': return 'Nueva';
        case 'contacted': return 'Contactado';
        case 'closed': return 'Cerrada';
        default: return status;
    }
  }


  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
        </Button>
        <h1 className="text-2xl font-bold text-primary">Gestión de Cotizaciones</h1>
        <div></div> {/* Placeholder for potential future actions like "Export" */}
      </div>

      {error && <p className="text-center text-destructive mb-4">{error}</p>}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Cotizaciones Recibidas</CardTitle>
          <CardDescription>Ver y gestionar todas las solicitudes de cotización de los clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : quotes.length === 0 && !error ? (
            <div className="text-center py-10">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">No hay cotizaciones</h3>
                <p className="mt-1 text-sm text-muted-foreground">Aún no se han recibido solicitudes de cotización.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha Evento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{format(parseISO(quote.submissionDate as unknown as string), "dd MMM yyyy, HH:mm", { locale: es })}</TableCell>
                    <TableCell className="font-medium">{quote.name}</TableCell>
                    <TableCell>{quote.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{quote.phone || '-'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{quote.eventDate ? format(parseISO(quote.eventDate), "dd MMM yyyy", { locale: es }) : '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={quote.status}
                        onValueChange={(newStatus: 'new' | 'contacted' | 'closed') => handleStatusChange(quote.id, newStatus)}
                        disabled={isUpdatingStatus}
                      >
                        <SelectTrigger className={`w-[120px] h-8 text-xs ${
                          quote.status === 'new' ? 'bg-primary/10 text-primary-foreground border-primary/30' :
                          quote.status === 'contacted' ? 'bg-secondary/10 text-secondary-foreground border-secondary/30' :
                          'bg-muted/50 text-muted-foreground border-border'
                        }`}>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <div className="flex items-center">
                                <Inbox className="mr-2 h-3 w-3 text-primary" /> Nueva
                            </div>
                           </SelectItem>
                          <SelectItem value="contacted">
                            <div className="flex items-center">
                               <PhoneOutgoing className="mr-2 h-3 w-3 text-secondary" /> Contactado
                            </div>
                          </SelectItem>
                          <SelectItem value="closed">
                             <div className="flex items-center">
                               <CheckCircle className="mr-2 h-3 w-3 text-muted-foreground" /> Cerrada
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button variant="ghost" size="sm" onClick={() => setSelectedQuoteDetails(quote)} title="Ver Detalles">
                             <Eye className="h-4 w-4" />
                           </Button>
                         </DialogTrigger>
                       </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedQuoteDetails && (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Cotización</DialogTitle>
            <DialogDescription>De: {selectedQuoteDetails.name} ({selectedQuoteDetails.email})</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="font-semibold text-muted-foreground">Fecha Solicitud:</span>
              <span>{format(parseISO(selectedQuoteDetails.submissionDate as unknown as string), "PPPPp", { locale: es })}</span>
            </div>
            {selectedQuoteDetails.phone && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-semibold text-muted-foreground">Teléfono:</span>
                <span>{selectedQuoteDetails.phone}</span>
              </div>
            )}
            {selectedQuoteDetails.eventDate && (
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <span className="font-semibold text-muted-foreground">Fecha Evento:</span>
                <span>{format(parseISO(selectedQuoteDetails.eventDate), "PPPP", { locale: es })}</span>
              </div>
            )}
             <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <span className="font-semibold text-muted-foreground pt-1">Servicios:</span>
                <div>
                {selectedQuoteDetails.services.filter(s => s !== 'other').map(serviceId => {
                    // In a real app, you might fetch service titles from their IDs
                    return <Badge key={serviceId} variant="secondary" className="mr-1 mb-1">{serviceId}</Badge>;
                })}
                {selectedQuoteDetails.services.includes('other') && selectedQuoteDetails.otherServiceDetail && (
                    <Badge variant="outline" className="mr-1 mb-1">Otro: {selectedQuoteDetails.otherServiceDetail}</Badge>
                )}
                </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <span className="font-semibold text-muted-foreground pt-1">Mensaje:</span>
                <p className="bg-muted p-2 rounded-md whitespace-pre-wrap">{selectedQuoteDetails.message}</p>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-2">
              <span className="font-semibold text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(selectedQuoteDetails.status)}>{getStatusText(selectedQuoteDetails.status)}</Badge>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      )}

    </div>
  );
}
