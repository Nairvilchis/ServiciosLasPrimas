
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
import { MessageSquare, Loader2 } from 'lucide-react'; // Added Loader2
import Link from 'next/link';
import type { Service } from '@/lib/types'; // Import Service type
import { addQuoteAction } from '@/app/actions/eventActions'; // Import the server action

// Define Zod schema for validation (Translated messages)
const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
  phone: z.string().optional(),
  eventDate: z.string().optional(),
  services: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debes seleccionar al menos un servicio.",
  }),
  message: z.string().min(10, { message: "El mensaje debe tener al menos 10 caracteres." }),
  otherServiceDetail: z.string().optional(), // Renamed from otherService to match Quote schema
});

type FormData = z.infer<typeof formSchema>;

interface ContactFormProps {
  servicesList: Service[]; // Accept services as a prop
}

export function ContactForm({ servicesList }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showOtherServiceInput, setShowOtherServiceInput] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventDate: "",
      services: [],
      message: "",
      otherServiceDetail: "", // Updated default
    },
  });

  // Watch the services field to show/hide "Otro" input
  const watchedServices = form.watch("services");
  React.useEffect(() => {
    if (watchedServices.includes("other")) {
      setShowOtherServiceInput(true);
    } else {
      setShowOtherServiceInput(false);
      form.setValue("otherServiceDetail", ""); // Clear if "Otro" is unchecked
    }
  }, [watchedServices, form]);


 async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Special handling for "other" service
    if (values.services.includes("other") && !values.otherServiceDetail) {
      toast({
        title: "Campo Requerido",
        description: "Por favor, especifica el servicio 'Otro'.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }


    try {
      const result = await addQuoteAction(formData); // Use the server action
      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: result.message,
        });
        form.reset(); // Reset form on success
        setShowOtherServiceInput(false); // Reset "Otro" input visibility
      } else {
        toast({
          title: "Error",
          description: result.message || "Error al enviar la cotización.",
          variant: "destructive",
        });
         if (result.errors) {
           console.error("Errores de validación:", result.errors);
           // Potentially set form errors here if your action returns them in a way react-hook-form can use
         }
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

  const whatsappNumber = "1234567890"; // Replace with actual number
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  const displayServices = [...servicesList, { id: "other", title: "Otro (Especificar abajo)", description: "", iconName: "HelpCircle", image: "", aiHint: "other service" }];


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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {displayServices.map((service) => (
                            <FormField
                              key={service.id}
                              control={form.control}
                              name="services" // Name for the array of services
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={service.id} // Key for the individual item
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(service.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), service.id])
                                            : field.onChange(
                                                (field.value || []).filter(
                                                  (value) => value !== service.id
                                                )
                                              )
                                        }}
                                        disabled={isSubmitting}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {service.title}
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

                  {showOtherServiceInput && (
                    <FormField
                      control={form.control}
                      name="otherServiceDetail" // Updated name
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especificar "Otro" Servicio</FormLabel>
                          <FormControl>
                            <Input placeholder="Describe el servicio que necesitas" {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}


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
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : "Enviar Consulta"}
                 </Button>
               </form>
             </Form>

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
