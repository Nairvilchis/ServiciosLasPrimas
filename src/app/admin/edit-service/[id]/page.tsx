'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updateServiceAction } from '@/app/actions/eventActions';
import { getServiceById } from '@/services/eventData'; // Service to fetch data
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Zod schema for input validation (can be partial for updates) - Translated messages
const ServiceUpdateSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres.").optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres.").optional(),
  iconName: z.string().min(1, "El nombre del ícono es requerido.").optional(),
  image: z.string().url("La imagen debe ser una URL válida.").optional(),
  aiHint: z.string().optional(), // Allow empty string
});

type ServiceFormData = z.infer<typeof ServiceUpdateSchema>;

interface EditServicePageProps {
  params: Promise<{ id: string }>; // params is a Promise
}

export default function EditServicePage({ params }: EditServicePageProps) {
  // Unwrap params using React.use() as recommended by Next.js
  const { id: serviceId } = React.use(params);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceUpdateSchema),
    defaultValues: async () => {
      setIsLoadingData(true);
      try {
        const service = await getServiceById(serviceId);
        if (!service) {
          setNotFound(true);
          toast({ title: "Error", description: "Servicio no encontrado.", variant: "destructive" });
          setIsLoadingData(false);
          return { title: '', description: '', iconName: '', image: '', aiHint: '' }; // Return default empty values
        }
        // Ensure aiHint is never null/undefined for the form
        const defaultValues = {
          ...service,
          aiHint: service.aiHint ?? '',
        };
        setIsLoadingData(false);
        return defaultValues;
      } catch (error) {
        console.error("Error al cargar datos del servicio:", error);
        toast({ title: "Error", description: "No se pudieron cargar los datos del servicio.", variant: "destructive" });
        setIsLoadingData(false);
        setNotFound(true); // Treat fetch error as not found for UI purposes
        return { title: '', description: '', iconName: '', image: '', aiHint: '' };
      }
    },
  });

  // UseEffect to reset form when default values are loaded asynchronously
  useEffect(() => {
    if (!isLoadingData && !notFound) {
      getServiceById(serviceId).then(service => {
         if (service) {
             form.reset({ ...service, aiHint: service.aiHint ?? '' });
         }
      });
    }
  }, [isLoadingData, notFound, serviceId, form]);


  async function onSubmit(values: ServiceFormData) {
    // Filter out unchanged values to send only the modified fields
    const changedValues: Partial<ServiceFormData> = {};
    const defaultVals = form.formState.defaultValues;
    for (const key in values) {
       const formKey = key as keyof ServiceFormData;
       // Check if the value exists and is different from the default value
       if (values[formKey] !== undefined && values[formKey] !== defaultVals?.[formKey]) {
          changedValues[formKey] = values[formKey];
       }
       // Specifically handle aiHint: if it's empty string and default was null/undefined, it's a change
       else if (formKey === 'aiHint' && values.aiHint === '' && (defaultVals?.aiHint === null || defaultVals?.aiHint === undefined)) {
            changedValues.aiHint = '';
       }
    }


    if (Object.keys(changedValues).length === 0) {
        toast({
            title: "Sin Cambios",
            description: "No has realizado ningún cambio para enviar.",
        });
        return;
    }


    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(changedValues).forEach(([key, value]) => {
       if (value !== undefined && value !== null) { // Ensure null values aren't appended if not intended
         formData.append(key, String(value));
       }
    });

    try {
      // Pass serviceId to the action
      const result = await updateServiceAction(serviceId, formData);

      if (result.success) {
        toast({
          title: '¡Éxito!',
          description: result.message,
        });
         // Optionally redirect or update form default values after successful update
         // router.push('/admin/services'); // Example redirect
         form.reset(result.data ? { ...result.data, aiHint: result.data.aiHint ?? '' } : undefined); // Update default values to reflect changes
      } else {
        toast({
          title: 'Error',
          description: result.message || "Error al actualizar el servicio.",
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

  if (isLoadingData) {
      return (
         <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
             <Skeleton className="h-8 w-32 mb-4" />
             <Card className="shadow-lg">
                 <CardHeader>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full" />
                 </CardHeader>
                 <CardContent className="space-y-6">
                      <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                      </div>
                       <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-20 w-full" />
                       </div>
                       <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                       </div>
                       <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full" />
                       </div>
                        <div className="space-y-2">
                         <Skeleton className="h-4 w-24" />
                         <Skeleton className="h-10 w-full" />
                       </div>
                       <Skeleton className="h-10 w-full" />
                 </CardContent>
             </Card>
         </div>
      );
  }

   if (notFound) {
       return (
           <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl text-center">
              <h1 className="text-2xl font-bold mb-4 text-destructive">Servicio No Encontrado</h1>
              <p className="text-muted-foreground mb-6">El servicio que intentas editar no existe.</p>
              <Button variant="outline" asChild>
                <Link href="/admin/services">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista de Servicios
                </Link>
              </Button>
           </div>
       );
   }


  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      <Button variant="outline" size="sm" asChild className="mb-4">
         <Link href="/admin/services">
           <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista de Servicios
         </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Editar Servicio</CardTitle>
          <CardDescription>Modifica los detalles de este servicio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Servicio</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. Creaciones con Arcos de Globos" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el servicio..."
                        className="resize-y min-h-[100px]"
                        {...field}
                        value={field.value ?? ''}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                control={form.control}
                name="iconName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Ícono (de Lucide)</FormLabel>
                    <FormControl>
                      <Input placeholder="ej. PartyPopper" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                    </FormControl>
                     <FormDescription>
                       Encuentra íconos en <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline text-primary">lucide.dev/icons</a>. Usa el nombre exacto (PascalCase).
                     </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la Imagen</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://picsum.photos/seed/yourservice/600/400" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                      Usa una URL completa. Para marcadores: `https://picsum.photos/seed/tu-semilla/600/400`
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <FormField
                 control={form.control}
                 name="aiHint"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Pista para IA (Opcional)</FormLabel>
                     <FormControl>
                       {/* Ensure value is controlled and never null/undefined */}
                       <Input placeholder="ej. arco de globos colorido" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                     </FormControl>
                     <FormDescription>
                        Palabras clave para búsqueda/generación de imágenes.
                     </FormDescription>
                     <FormMessage />
                   </FormItem>
                 )}
               />


              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || isLoadingData}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar Cambios'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
