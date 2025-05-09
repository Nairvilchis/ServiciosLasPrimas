
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
import { updateSiteSettingsAction } from '@/app/actions/eventActions';
import { getSiteSettings } from '@/services/eventData';
import type { SiteSetting } from '@/lib/types';
import { ArrowLeft, Loader2, SettingsIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

const SiteSettingsInputSchema = z.object({
  whatsappNumber: z.string().min(10, "El número de WhatsApp debe tener al menos 10 dígitos.").regex(/^\+?[1-9]\d{1,14}$/, "Número de WhatsApp inválido (ej: +521234567890)."),
  contactEmail: z.string().email("Correo electrónico de contacto inválido."),
  contactPhone: z.string().min(10, "El teléfono de contacto debe tener al menos 10 dígitos.").regex(/^\+?[1-9]\d{1,14}$/, "Teléfono de contacto inválido (ej: +529991234567)."),
  copyrightText: z.string().optional(),
});

type SiteSettingsFormData = z.infer<typeof SiteSettingsInputSchema>;

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<SiteSettingsFormData>({
    resolver: zodResolver(SiteSettingsInputSchema),
    defaultValues: async () => {
      setIsLoadingData(true);
      try {
        const settings = await getSiteSettings();
        return {
          whatsappNumber: settings.whatsappNumber || '',
          contactEmail: settings.contactEmail || '',
          contactPhone: settings.contactPhone || '',
          copyrightText: settings.copyrightText || `© ${new Date().getFullYear()} Servicios Las Primas. Todos los derechos reservados.`,
        };
      } catch (error) {
        console.error("Error al cargar la configuración del sitio:", error);
        toast({ title: "Error", description: "No se pudo cargar la configuración.", variant: "destructive" });
        return { whatsappNumber: '', contactEmail: '', contactPhone: '', copyrightText: '' };
      } finally {
        setIsLoadingData(false);
      }
    },
  });
  
  // Effect to re-fetch and reset form when component mounts or data might have changed
  // This is useful if the defaultValues promise resolves after initial render.
  useEffect(() => {
    if (!isLoadingData) { // Only run if initial load is complete
        getSiteSettings().then(settings => {
            form.reset({
                whatsappNumber: settings.whatsappNumber || '',
                contactEmail: settings.contactEmail || '',
                contactPhone: settings.contactPhone || '',
                copyrightText: settings.copyrightText || `© ${new Date().getFullYear()} Servicios Las Primas. Todos los derechos reservados.`,
            });
        }).catch(error => {
             console.error("Error al recargar la configuración del sitio:", error);
        });
    }
  }, [form, isLoadingData]);


  async function onSubmit(values: SiteSettingsFormData) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    try {
      const result = await updateSiteSettingsAction(formData);
      if (result.success) {
        toast({
          title: '¡Éxito!',
          description: result.message,
        });
        if (result.data) {
            form.reset({ // Update form with the new saved values
                whatsappNumber: result.data.whatsappNumber,
                contactEmail: result.data.contactEmail,
                contactPhone: result.data.contactPhone,
                copyrightText: result.data.copyrightText || `© ${new Date().getFullYear()} Servicios Las Primas. Todos los derechos reservados.`,
            });
        }
      } else {
        toast({
          title: 'Error',
          description: result.message || "Error al actualizar la configuración.",
          variant: 'destructive',
        });
        if (result.errors) {
          console.error("Errores de validación:", result.errors);
        }
      }
    } catch (error) {
      console.error('Error de envío:', error);
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado.";
      toast({
        title: 'Error',
        description: `Error al actualizar: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
        <Skeleton className="h-8 w-40 mb-4" />
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-56 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      <Button variant="outline" size="sm" onClick={() => router.push('/admin')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Panel
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold text-primary">Configuración del Sitio</CardTitle>
          </div>
          <CardDescription>Actualiza la información de contacto y pie de página.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="+521234567890" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Incluye el código de país (ej. +52 para México).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico de Contacto</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@ejemplo.com" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de Contacto (Footer)</FormLabel>
                    <FormControl>
                      <Input placeholder="+52 999 123 4567" {...field} disabled={isSubmitting} />
                    </FormControl>
                     <FormDescription>Número que aparecerá en el pie de página.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="copyrightText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto de Copyright (Pie de Página)</FormLabel>
                    <FormControl>
                      <Textarea placeholder={`© ${new Date().getFullYear()} Tu Empresa. Todos los derechos reservados.`} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || isLoadingData}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar Configuración'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
