
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getServices, deleteService } from '@/services/eventData';
import type { Service } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteServiceAction } from '@/app/actions/eventActions';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const fetchedServices = await getServices();
        setServices(fetchedServices);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Could not load services. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
  };

  const handleConfirmDelete = () => {
    if (!serviceToDelete) return;

    startDeleteTransition(async () => {
      const result = await deleteServiceAction(serviceToDelete.id);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        // Optimistically remove from state or refetch
        setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete service.',
          variant: 'destructive',
        });
      }
      setServiceToDelete(null); // Close dialog
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-primary">Manage Services</h1>
        <Button asChild>
          <Link href="/admin/add-service">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
          </Link>
        </Button>
      </div>

      {error && <p className="text-center text-destructive mb-4">{error}</p>}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Current Services</CardTitle>
          <CardDescription>View, edit, or delete existing services.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : services.length === 0 && !error ? (
             <p className="text-center text-muted-foreground py-4">No services found. Add one to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={60}
                        height={40}
                        className="rounded-sm object-cover"
                        unoptimized // If using external URLs not in next.config.js
                      />
                    </TableCell>
                    <TableCell className="font-medium">{service.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-xs">
                        {service.description}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild title="Edit">
                            <Link href={`/admin/edit-service/${service.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                             </Link>
                          </Button>
                          <Button
                             variant="destructive"
                             size="sm"
                             onClick={() => handleDeleteClick(service)}
                             disabled={isDeleting && serviceToDelete?.id === service.id}
                             title="Delete"
                           >
                             {isDeleting && serviceToDelete?.id === service.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                             ) : (
                               <Trash2 className="h-4 w-4" />
                             )}
                             <span className="sr-only">Delete</span>
                           </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

       {/* Delete Confirmation Dialog */}
       <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
             <AlertDialogDescription>
               This action cannot be undone. This will permanently delete the service
               <span className="font-semibold"> "{serviceToDelete?.title}"</span>.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
               {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
