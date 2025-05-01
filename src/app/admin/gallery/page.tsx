'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPhotos } from '@/services/eventData'; // Assuming getPhotos exists
import type { GalleryPhoto } from '@/lib/types';
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
import { deletePhotoAction } from '@/app/actions/eventActions'; // Assuming deletePhotoAction exists
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [photoToDelete, setPhotoToDelete] = useState<GalleryPhoto | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const fetchedPhotos = await getPhotos();
        setPhotos(fetchedPhotos);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch photos:", err);
        setError("Could not load photos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDeleteClick = (photo: GalleryPhoto) => {
    setPhotoToDelete(photo);
  };

  const handleConfirmDelete = () => {
    if (!photoToDelete) return;

    startDeleteTransition(async () => {
      const result = await deletePhotoAction(photoToDelete.id);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        // Optimistically remove from state or refetch
        setPhotos(prev => prev.filter(p => p.id !== photoToDelete.id));
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete photo.',
          variant: 'destructive',
        });
      }
      setPhotoToDelete(null); // Close dialog
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
        <h1 className="text-2xl font-bold text-primary">Manage Gallery</h1>
        <Button asChild>
          <Link href="/admin/add-photo">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Photo
          </Link>
        </Button>
      </div>

      {error && <p className="text-center text-destructive mb-4">{error}</p>}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Gallery Photos</CardTitle>
          <CardDescription>View, edit, or delete gallery photos.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
           ) : photos.length === 0 && !error ? (
              <p className="text-center text-muted-foreground py-4">No photos found in the gallery. Add one to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Preview</TableHead>
                  <TableHead>Alt Text</TableHead>
                  <TableHead className="hidden md:table-cell">AI Hint</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {photos.map((photo) => (
                  <TableRow key={photo.id}>
                    <TableCell>
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        width={100} // Adjust width as needed
                        height={66} // Adjust height for aspect ratio
                        className="rounded-sm object-cover"
                        unoptimized // If using external URLs not in next.config.js
                      />
                    </TableCell>
                    <TableCell className="font-medium">{photo.alt}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {photo.aiHint || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild title="Edit">
                            <Link href={`/admin/edit-photo/${photo.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                             </Link>
                          </Button>
                          <Button
                             variant="destructive"
                             size="sm"
                             onClick={() => handleDeleteClick(photo)}
                             disabled={isDeleting && photoToDelete?.id === photo.id}
                             title="Delete"
                           >
                             {isDeleting && photoToDelete?.id === photo.id ? (
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
       <AlertDialog open={!!photoToDelete} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
             <AlertDialogDescription>
               This action cannot be undone. This will permanently delete the photo with alt text:
               <span className="font-semibold"> "{photoToDelete?.alt}"</span>.
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
```