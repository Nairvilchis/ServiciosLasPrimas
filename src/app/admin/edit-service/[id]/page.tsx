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

// Zod schema for input validation (can be partial for updates)
const ServiceUpdateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").optional(),
  description: z.string().min(10, "Description must be at least 10 characters.").optional(),
  iconName: z.string().min(1, "Icon name is required.").optional(),
  image: z.string().url("Image must be a valid URL.").optional(),
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
          toast({ title: "Error", description: "Service not found.", variant: "destructive" });
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
        console.error("Failed to fetch service data:", error);
        toast({ title: "Error", description: "Could not load service data.", variant: "destructive" });
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
            title: "No Changes",
            description: "You haven't made any changes to submit.",
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
          title: 'Success!',
          description: result.message,
        });
         // Optionally redirect or update form default values after successful update
         // router.push('/admin/services'); // Example redirect
         form.reset(result.data ? { ...result.data, aiHint: result.data.aiHint ?? '' } : undefined); // Update default values to reflect changes
      } else {
        toast({
          title: 'Error',
          description: result.message || "Failed to update service.",
          variant: 'destructive',
        });
        if (result.errors) {
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
              <h1 className="text-2xl font-bold mb-4 text-destructive">Service Not Found</h1>
              <p className="text-muted-foreground mb-6">The service you are trying to edit does not exist.</p>
              <Button variant="outline" asChild>
                <Link href="/admin/services">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services List
                </Link>
              </Button>
           </div>
       );
   }


  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-2xl">
      <Button variant="outline" size="sm" asChild className="mb-4">
         <Link href="/admin/services">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services List
         </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Edit Service</CardTitle>
          <CardDescription>Modify the details for this service.</CardDescription>
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
                      <Input placeholder="e.g., Balloon Arch Creations" {...field} value={field.value ?? ''} disabled={isSubmitting} />
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
                    <FormLabel>Icon Name (from Lucide)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PartyPopper" {...field} value={field.value ?? ''} disabled={isSubmitting} />
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
                      <Input type="url" placeholder="https://picsum.photos/seed/yourservice/600/400" {...field} value={field.value ?? ''} disabled={isSubmitting} />
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
                       {/* Ensure value is controlled and never null/undefined */}
                       <Input placeholder="e.g., colorful balloon arch" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                     </FormControl>
                     <FormDescription>
                        Keywords for image search/generation.
                     </FormDescription>
                     <FormMessage />
                   </FormItem>
                 )}
               />


              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting || isLoadingData}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
