
"use client"
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {  
 const router = useRouter();

 const handleServicesClick = () => {
  router.push("/admin/services");
 };

 const handleGalleryClick = () => {
  router.push("/admin/gallery");
 };

 return (
  <div className="container mx-auto px-4 py-12 md:py-16">
   <h1 className="text-3xl font-bold text-primary mb-8">Panel de Administración</h1>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <Card
     onClick={handleServicesClick}
     className="cursor-pointer hover:shadow-md transition-shadow select-none w-full"
    >
     <CardHeader>
      <CardTitle className="text-xl">Servicios</CardTitle>
     </CardHeader>
     <CardContent className="text-center p-6">
      <p>Gestiona y edita tus servicios.</p>
     </CardContent>
    </Card>
    <Card
     onClick={handleGalleryClick}
     className="cursor-pointer hover:shadow-md transition-shadow select-none w-full"
    >
     <CardHeader>
      <CardTitle className="text-xl">Galería</CardTitle>
     </CardHeader>
     <CardContent className="text-center p-6">
      <p>Gestiona y edita las fotos de tu galería.</p>
     </CardContent>
    </Card>
   </div>
  </div>
 );
}