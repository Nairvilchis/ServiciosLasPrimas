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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addServiceAction } from '@/app/actions/eventActions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Re-use the Zod schema from actions (or define it here if preferred) - Translated messages
const ServiceInputSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  // Consider a select or autocomplete for icon names in a real app
  iconName: z.string().min(1, "Se requiere el nombre del ícono (ej. 'CakeSlice', 'Wine'). Ver lucide.dev para nombres."),
  image: z.string().url("La imagen debe ser una URL válida (ej. de picsum.photos o tu almacenamiento)."),
  aiHint: z.string().optional().default(""),
});

type ServiceFormData = z.infer<typeof ServiceInputSchema>;

export default function AddServicePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceInputSchema),
    defaultValues: {
      title: '',
      description: '',
      iconName: '',
      image: '',
      aiHint: '',
    },
  });

  async function onSubmit(values: ServiceFormData) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    try {
      const result = await addServiceAction(formData);

      if (result.success) {
        toast({
          title: '¡Éxito!',
          description: result.message,
        });
        form.reset(); // Reset form on success
      } else {
        toast({
          title: 'Error',
          description: result.message || "Error al añadir el servicio.",
          variant: 'destructive',
        });
        // Optionally display field-specific errors if available
        if (result.errors) {
          // You might want to map these errors to form fields if using react-hook-form's error handling more deeply
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
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      <Button variant="outline" size="sm" asChild className="mb-4">
         <Link href="/">
           <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio
         </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Añadir Nuevo Servicio</CardTitle>
          <CardDescription>Rellena los detalles para el nuevo servicio.</CardDescription>
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
                      <Input placeholder="ej. Creaciones con Arcos de Globos" {...field} disabled={isSubmitting} />
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
                      <Input placeholder="ej. PartyPopper" {...field} disabled={isSubmitting} />
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
                      <Input type="url" placeholder="https://picsum.photos/seed/newservice/600/400" {...field} disabled={isSubmitting} />
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
                      <Input placeholder="ej. arco de globos colorido" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                      Palabras clave para búsqueda/generación de imágenes (si usas imágenes reales más tarde).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? 'Añadiendo...' : 'Añadir Servicio'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
