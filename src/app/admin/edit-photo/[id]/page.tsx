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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { updatePhotoAction } from '@/app/actions/eventActions';
import { getPhotoById } from '@/services/eventData'; // Service to fetch photo data
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Zod schema for input validation (can be partial for updates)
const PhotoUpdateSchema = z.object({
  src: z.string().url("La fuente debe ser una URL válida.").optional(),
  alt: z.string().min(3, "El texto alternativo debe tener al menos 3 caracteres.").optional(),
  aiHint: z.string().optional(), // Allow empty string
});

type PhotoFormData = z.infer<typeof PhotoUpdateSchema>;

interface EditPhotoPageProps {
  params: Promise<{ id: string }>; // params is a Promise
}

export default function EditPhotoPage({ params }: EditPhotoPageProps) {
  // Unwrap params using React.use() as recommended by Next.js
  const { id: photoId } = React.use(params);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PhotoFormData>({
    resolver: zodResolver(PhotoUpdateSchema),
    defaultValues: async () => {
      setIsLoadingData(true);
      try {
        const photo = await getPhotoById(photoId);
        if (!photo) {
          setNotFound(true);
          toast({ title: "Error", description: "Foto no encontrada.", variant: "destructive" });
          setIsLoadingData(false);
          return { src: '', alt: '', aiHint: '' };
        }
        const defaultValues = {
          ...photo,
          aiHint: photo.aiHint ?? '', // Ensure aiHint is never null/undefined
        };
        setImagePreview(photo.src); // Set initial preview
        setIsLoadingData(false);
        return defaultValues;
      } catch (error) {
        console.error("Error al cargar datos de la foto:", error);
        toast({ title: "Error", description: "No se pudieron cargar los datos de la foto.", variant: "destructive" });
        setIsLoadingData(false);
        setNotFound(true);
        return { src: '', alt: '', aiHint: '' };
      }
    },
  });

   // Watch the 'src' field to update the preview
   const imageUrl = form.watch('src');
   React.useEffect(() => {
     // Basic validation for preview
     if (imageUrl && imageUrl.startsWith('http') && form.getFieldState('src').error === undefined) {
       setImagePreview(imageUrl);
     } else if (!imageUrl && form.formState.defaultValues?.src) {
        // If cleared, revert to default preview if available
        setImagePreview(form.formState.defaultValues.src);
     }
     else {
       setImagePreview(null);
     }
   }, [imageUrl, form]);

   // UseEffect to reset form when default values are loaded asynchronously
   useEffect(() => {
     if (!isLoadingData && !notFound) {
       getPhotoById(photoId).then(photo => {
         if (photo) {
           const defaultValues = { ...photo, aiHint: photo.aiHint ?? '' };
           form.reset(defaultValues);
           setImagePreview(photo.src); // Re-set preview on reset
         }
       });
     }
   }, [isLoadingData, notFound, photoId, form]);


  async function onSubmit(values: PhotoFormData) {
      // Filter out unchanged values
      const changedValues: Partial<PhotoFormData> = {};
      const defaultVals = form.formState.defaultValues;
      for (const key in values) {
          const formKey = key as keyof PhotoFormData;
          if (values[formKey] !== undefined && values[formKey] !== defaultVals?.[formKey]) {
              changedValues[formKey] = values[formKey];
          }
           // Specific check for aiHint potentially changing from null/undefined to ""
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
        if (value !== undefined && value !== null) {
            formData.append(key, String(value));
        }
     });


    try {
      const result = await updatePhotoAction(photoId, formData);

      if (result.success) {
        toast({
          title: '¡Éxito!',
          description: result.message,
        });
        // Update default values and reset form state
        form.reset(result.data ? { ...result.data, aiHint: result.data.aiHint ?? '' } : undefined);
        if (result.data?.src) {
             setImagePreview(result.data.src); // Update preview
        }
      } else {
        toast({
          title: 'Error',
          description: result.message || "Error al actualizar la foto.",
          variant: 'destructive',
        });
        if (result.errors) {
          console.error("Errores de campo:", result.errors);
        }
      }
    } catch (error) {
      console.error('Error de envío:', error);
       const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
      toast({
        title: 'Error',
        description: `Ocurrió un error inesperado: ${errorMessage}. Por favor, inténtalo de nuevo.`,
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
                     {/* Preview Skeleton */}
                      <div className="mt-4 p-2 border rounded-md bg-muted">
                         <Skeleton className="h-4 w-20 mb-2" />
                         <Skeleton className="h-[200px] w-[300px] rounded-md mx-auto" />
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
              <h1 className="text-2xl font-bold mb-4 text-destructive">Foto No Encontrada</h1>
              <p className="text-muted-foreground mb-6">La foto que intentas editar no existe.</p>
              <Button variant="outline" asChild>
                <Link href="/admin/gallery">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista de Galería
                </Link>
              </Button>
           </div>
       );
   }


  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
        <Button variant="outline" size="sm" asChild className="mb-4">
           <Link href="/admin/gallery">
             <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista de Galería
           </Link>
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Editar Foto de Galería</CardTitle>
          <CardDescription>Modifica los detalles de esta imagen de la galería.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="src"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Origen de la Imagen</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://picsum.photos/seed/yourphoto/1200/800" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                       Debe ser una URL completa. Usa `https://picsum.photos/seed/tu-semilla/1200/800` para marcadores de posición.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 p-2 border rounded-md bg-muted">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Vista Previa:</p>
                  <Image
                     src={imagePreview}
                     alt="Vista Previa"
                     width={300}
                     height={200}
                     className="object-contain rounded-md mx-auto"
                     unoptimized
                  />
                </div>
              )}


              <FormField
                control={form.control}
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto Alternativo</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe la imagen para accesibilidad" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                      Describe brevemente el contenido de la imagen.
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
                       <Input placeholder="ej. pastel de bodas flores" {...field} value={field.value ?? ''} disabled={isSubmitting} />
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
