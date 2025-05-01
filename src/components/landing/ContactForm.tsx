
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { MessageSquare } from 'lucide-react'; // Using a generic message icon
import Link from 'next/link';

// Mock services for checkbox group (Translated)
const services = [
  { id: "candyBar", label: "Mesa de Dulces" },
  { id: "cakes", label: "Pasteles Personalizados" },
  { id: "rentals", label: "Renta de Mesas y Sillas" },
  { id: "openBar", label: "Servicio de Barra Libre" },
  { id: "other", label: "Otro (Especificar abajo)" },
] as const; // Use 'as const' for type safety

// Define Zod schema for validation (Translated messages)
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
  phone: z.string().optional(),
  eventDate: z.string().optional(), // Consider using a date picker component later
  services: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debes seleccionar al menos un servicio.",
  }),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
});

type FormData = z.infer<typeof formSchema>;

// Mock server action (Translated messages)
async function submitInquiry(data: FormData): Promise<{ success: boolean; message: string }> {
  console.log("Enviando consulta:", data);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate success/failure
  const success = Math.random() > 0.2; // 80% success rate
  if (success) {
    return { success: true, message: "¡Consulta enviada con éxito! Nos pondremos en contacto pronto." };
  } else {
    return { success: false, message: "Error al enviar la consulta. Por favor, inténtalo de nuevo más tarde." };
  }
}

export function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      services: [],
      message: "",
    },
  });

 async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    try {
      const result = await submitInquiry(values);
      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message,
        });
        form.reset(); // Reset form on success
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error de envío:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Replace with your actual WhatsApp number (including country code without + or spaces)
  const whatsappNumber = "1234567890"; // Example number
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <section id="contact" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <Card className="shadow-lg border-primary">
           <CardHeader className="text-center">
             <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">Obtén una Cotización</CardTitle>
             <CardDescription>Completa el formulario o contáctanos directamente.</CardDescription>
           </CardHeader>
           <CardContent>
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu Nombre" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="tu.correo@ejemplo.com" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono (Opcional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Tu Número de Teléfono" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                       control={form.control}
                       name="eventDate"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Fecha del Evento (Opcional)</FormLabel>
                           <FormControl>
                             {/* Basic input for now, replace with Calendar/DatePicker later */}
                             <Input type="date" {...field} disabled={isSubmitting} />
                           </FormControl>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                 </div>

                 <FormField
                    control={form.control}
                    name="services"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Servicios de Interés</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {services.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="services"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                        disabled={isSubmitting}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                         </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                 <FormField
                   control={form.control}
                   name="message"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Mensaje / Detalles del Evento</FormLabel>
                       <FormControl>
                         <Textarea
                           placeholder="Cuéntanos sobre tu evento..."
                           className="resize-y min-h-[100px]"
                           {...field}
                           disabled={isSubmitting}
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Consulta"}
                 </Button>
               </form>
             </Form>

              {/* WhatsApp Link */}
             <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">O envíanos un mensaje directamente por WhatsApp:</p>
                 <Button variant="outline" asChild>
                    <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                       <MessageSquare className="mr-2 h-4 w-4" /> Chatear por WhatsApp
                    </Link>
                 </Button>
             </div>

           </CardContent>
        </Card>
      </div>
    </section>
  );
}
