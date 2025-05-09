
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CalendarClock, ShoppingCart, FileText, PlusCircle, ListChecks } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AgendaFinanzasPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <Button variant="outline" size="sm" onClick={() => router.push('/admin')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Panel de Administración
      </Button>

      <Card className="shadow-xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Agenda Personal y Finanzas</CardTitle>
          <CardDescription>Organiza tus citas, registra tus gastos y crea presupuestos para tus clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agenda" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
              <TabsTrigger value="agenda" className="text-sm md:text-base">
                <CalendarClock className="mr-2 h-5 w-5" />
                Agenda de Servicios
              </TabsTrigger>
              <TabsTrigger value="compras" className="text-sm md:text-base">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Registro de Compras
              </TabsTrigger>
              <TabsTrigger value="presupuestos" className="text-sm md:text-base">
                <FileText className="mr-2 h-5 w-5" />
                Creación de Presupuestos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agenda">
              <Card className="border-secondary">
                <CardHeader>
                  <CardTitle className="text-xl text-secondary-foreground">Agenda de Servicios</CardTitle>
                  <CardDescription>Visualiza y gestiona tus citas y eventos programados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6 min-h-[300px]">
                  <div className="flex justify-end">
                    <Button variant="outline" className="border-secondary text-secondary-foreground hover:bg-secondary/10">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Crear Nuevo Evento
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-secondary-foreground/90">Próximos Eventos:</h3>
                    <div className="space-y-3">
                      <div className="p-3 border border-secondary/30 rounded-md bg-secondary/5">
                        <p className="font-medium text-secondary-foreground/80">Boda Pérez - García</p>
                        <p className="text-sm text-muted-foreground">Fecha: 25 de Diciembre, 2024 - 14:00</p>
                        <p className="text-sm text-muted-foreground">Servicios: Mesa de Dulces, Pastel</p>
                      </div>
                      <div className="p-3 border border-secondary/30 rounded-md bg-secondary/5">
                        <p className="font-medium text-secondary-foreground/80">Cumpleaños Sofía</p>
                        <p className="text-sm text-muted-foreground">Fecha: 10 de Enero, 2025 - 16:00</p>
                        <p className="text-sm text-muted-foreground">Servicios: Renta de Mobiliario</p>
                      </div>
                       <p className="text-center text-muted-foreground italic pt-4">
                        (Funcionalidad completa de calendario y gestión de eventos por implementar)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compras">
              <Card className="border-accent">
                <CardHeader>
                  <CardTitle className="text-xl text-accent-foreground">Registro de Compras y Gastos</CardTitle>
                  <CardDescription>Lleva un control de todas las compras y gastos relacionados con tu negocio.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6 min-h-[200px] flex items-center justify-center">
                   <p className="text-muted-foreground italic">
                    Registra aquí tus facturas, compras de material, y otros gastos operativos.
                    (Funcionalidad de tabla de gastos y formularios por implementar)
                  </p>
                  {/* Placeholder for expense tracking component */}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="presupuestos">
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-xl text-destructive-foreground">Creación de Presupuestos</CardTitle>
                  <CardDescription>Genera presupuestos detallados para tus clientes de forma rápida y sencilla.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6 min-h-[200px] flex items-center justify-center">
                   <p className="text-muted-foreground italic">
                    Crea, guarda y envía presupuestos personalizados para cada evento o servicio.
                    (Funcionalidad de generador de presupuestos por implementar)
                  </p>
                  {/* Placeholder for quote generation component */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

