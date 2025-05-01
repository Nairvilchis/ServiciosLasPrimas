'use client';

import React, { useState } from 'react';
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
import { addPhotoAction } from '@/app/actions/eventActions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image'; // Import Image for preview

// Re-use the Zod schema from actions - Translated messages
const PhotoInputSchema = z.object({
  src: z.string().url("La fuente debe ser una URL válida."),
  alt: z.string().min(3, "El texto alternativo debe tener al menos 3 caracteres."),
  aiHint: z.string().optional().default(""),
});

type PhotoFormData = z.infer<typeof PhotoInputSchema>;

export default function AddPhotoPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview

  const form = useForm<PhotoFormData>({
    resolver: zodResolver(PhotoInputSchema),
    defaultValues: {
      src: '',
      alt: '',
      aiHint: '',
    },
  });

  // Watch the 'src' field to update the preview
  const imageUrl = form.watch('src');
  React.useEffect(() => {
    // Basic validation for preview
    if (imageUrl && imageUrl.startsWith('http') && form.getFieldState('src').error === undefined) {
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [imageUrl, form]);


  async function onSubmit(values: PhotoFormData) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
         formData.append(key, String(value));
       }
    });

    try {
      const result = await addPhotoAction(formData);

      if (result.success) {
        toast({
          title: '¡Éxito!',
          description: result.message,
        });
        form.reset(); // Reset form on success
        setImagePreview(null); // Clear preview
      } else {
        toast({
          title: 'Error',
          description: result.message || "Error al añadir la foto.",
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

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
        <Button variant="outline" size="sm" asChild className="mb-4">
           <Link href="/">
             <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
           </Link>
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Añadir Nueva Foto a la Galería</CardTitle>
          <CardDescription>Proporciona los detalles para la nueva imagen de la galería.</CardDescription>
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
                      <Input type="url" placeholder="https://picsum.photos/seed/newphoto/1200/800" {...field} disabled={isSubmitting} />
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
                     width={300} // Adjust size as needed
                     height={200} // Adjust size as needed
                     className="object-contain rounded-md mx-auto" // Center the preview
                     unoptimized // Important for external URLs if not configured in next.config.js
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
                      <Input placeholder="Describe la imagen para accesibilidad" {...field} disabled={isSubmitting} />
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
                      <Input placeholder="ej. pastel de bodas flores" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                       Palabras clave para búsqueda/generación de imágenes (si reemplazas marcadores más tarde).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? 'Añadiendo...' : 'Añadir Foto'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
