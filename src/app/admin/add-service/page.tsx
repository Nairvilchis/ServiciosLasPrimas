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

// Re-use the Zod schema from actions (or define it here if preferred)
const ServiceInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  // Consider a select or autocomplete for icon names in a real app
  iconName: z.string().min(1, "Icon name is required (e.g., 'CakeSlice', 'Wine'). See lucide.dev for names."),
  image: z.string().url("Image must be a valid URL (e.g., from picsum.photos or your storage)."),
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
          title: 'Success!',
          description: result.message,
        });
        form.reset(); // Reset form on success
      } else {
        toast({
          title: 'Error',
          description: result.message || "Failed to add service.",
          variant: 'destructive',
        });
        // Optionally display field-specific errors if available
        if (result.errors) {
          // You might want to map these errors to form fields if using react-hook-form's error handling more deeply
          console.error("Field Errors:", result.errors);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
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
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
         </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Add New Service</CardTitle>
          <CardDescription>Fill in the details for the new service.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Balloon Arch Creations" {...field} disabled={isSubmitting} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the service..."
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
                    <FormLabel>Icon Name (from Lucide)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PartyPopper" {...field} disabled={isSubmitting} />
                    </FormControl>
                     <FormDescription>
                       Find icons at <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline text-primary">lucide.dev/icons</a>. Use the exact name (PascalCase).
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
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://picsum.photos/seed/newservice/600/400" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                      Use a full URL. For placeholders: `https://picsum.photos/seed/your-seed/600/400`
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
                    <FormLabel>AI Hint (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., colorful balloon arch" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>
                      Keywords for image search/generation (if using real images later).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Service'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
