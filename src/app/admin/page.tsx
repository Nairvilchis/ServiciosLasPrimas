
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { CalendarCheck, DollarSign, FileText, GalleryHorizontal, ListTree, MessageSquareText, Settings } from "lucide-react"; // Added Settings

export default function AdminDashboard() {
 const router = useRouter();

 const handleNavigation = (path: string) => {
  router.push(path);
 };

 return (
  <div className="container mx-auto px-4 py-12 md:py-16">
   <h1 className="text-3xl font-bold text-primary mb-8 text-center">Panel de Administración</h1>
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <Card
     onClick={() => handleNavigation("/admin/services")}
     className="cursor-pointer hover:shadow-xl transition-shadow select-none w-full transform hover:scale-105"
    >
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-medium">Servicios</CardTitle>
      <ListTree className="h-6 w-6 text-muted-foreground" />
     </CardHeader>
     <CardContent className="text-center p-6">
      <p className="text-sm text-muted-foreground">Gestiona y edita tus servicios.</p>
     </CardContent>
    </Card>
    <Card
     onClick={() => handleNavigation("/admin/gallery")}
     className="cursor-pointer hover:shadow-xl transition-shadow select-none w-full transform hover:scale-105"
    >
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-medium">Galería</CardTitle>
      <GalleryHorizontal className="h-6 w-6 text-muted-foreground" />
     </CardHeader>
     <CardContent className="text-center p-6">
      <p className="text-sm text-muted-foreground">Gestiona y edita las fotos de tu galería.</p>
     </CardContent>
    </Card>
    <Card
     onClick={() => handleNavigation("/admin/agenda")}
     className="cursor-pointer hover:shadow-xl transition-shadow select-none w-full transform hover:scale-105"
    >
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-medium">Agenda y Finanzas</CardTitle>
      <CalendarCheck className="h-6 w-6 text-muted-foreground" />
     </CardHeader>
     <CardContent className="text-center p-6">
      <p className="text-sm text-muted-foreground">Gestiona tu agenda, compras y presupuestos.</p>
     </CardContent>
    </Card>
    <Card
     onClick={() => handleNavigation("/admin/quotes")}
     className="cursor-pointer hover:shadow-xl transition-shadow select-none w-full transform hover:scale-105"
    >
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-medium">Cotizaciones</CardTitle>
      <MessageSquareText className="h-6 w-6 text-muted-foreground" />
     </CardHeader>
     <CardContent className="text-center p-6">
      <p className="text-sm text-muted-foreground">Revisa y gestiona las solicitudes de cotización.</p>
     </CardContent>
    </Card>
    <Card
     onClick={() => handleNavigation("/admin/settings")}
     className="cursor-pointer hover:shadow-xl transition-shadow select-none w-full transform hover:scale-105"
    >
     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xl font-medium">Configuración</CardTitle>
      <Settings className="h-6 w-6 text-muted-foreground" />
     </CardHeader>
     <CardContent className="text-center p-6">
      <p className="text-sm text-muted-foreground">Modifica la información de contacto y pie de página.</p>
     </CardContent>
    </Card>
   </div>
  </div>
 );
}
