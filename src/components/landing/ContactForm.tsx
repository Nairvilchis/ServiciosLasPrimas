
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

// Mock services for checkbox group
const services = [
  { id: "candyBar", label: "Candy Bar" },
  { id: "cakes", label: "Custom Cakes" },
  { id: "rentals", label: "Table & Chair Rentals" },
  { id: "openBar", label: "Open Bar Service" },
  { id: "other", label: "Other (Specify below)" },
] as const; // Use 'as const' for type safety

// Define Zod schema for validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  eventDate: z.string().optional(), // Consider using a date picker component later
  services: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one service.",
  }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type FormData = z.infer<typeof formSchema>;

// Mock server action (replace with actual API call or server action later)
async function submitInquiry(data: FormData): Promise<{ success: boolean; message: string }> {
  console.log("Submitting inquiry:", data);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate success/failure
  const success = Math.random() > 0.2; // 80% success rate
  if (success) {
    return { success: true, message: "Inquiry sent successfully! We'll be in touch soon." };
  } else {
    return { success: false, message: "Failed to send inquiry. Please try again later." };
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
          title: "Success!",
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
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
             <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">Get a Quote</CardTitle>
             <CardDescription>Fill out the form below or contact us directly.</CardDescription>
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
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} disabled={isSubmitting} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} disabled={isSubmitting} />
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
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Your Phone Number" {...field} disabled={isSubmitting} />
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
                           <FormLabel>Event Date (Optional)</FormLabel>
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
                          <FormLabel className="text-base">Services Interested In</FormLabel>
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
                       <FormLabel>Message / Event Details</FormLabel>
                       <FormControl>
                         <Textarea
                           placeholder="Tell us about your event..."
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
                    {isSubmitting ? "Sending..." : "Send Inquiry"}
                 </Button>
               </form>
             </Form>

              {/* WhatsApp Link */}
             <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Or message us directly on WhatsApp:</p>
                 <Button variant="outline" asChild>
                    <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
                       <MessageSquare className="mr-2 h-4 w-4" /> Chat on WhatsApp
                    </Link>
                 </Button>
             </div>

           </CardContent>
        </Card>
      </div>
    </section>
  );
}
