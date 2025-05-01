import { LucideProps, IconNode } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
// Assuming LucideIconName is a type exported from '@/lib/types'
// This type should ideally be a union of string literals corresponding to valid Lucide icon names
import { LucideIconName } from '@/lib/types';
import React from 'react';

// Assuming DefaultIcon is a valid React component imported or defined elsewhere.
// Declare it here so TypeScript knows it exists and is a React Element type.
// TODO: Import or define your actual DefaultIcon component
declare const DefaultIcon: React.ElementType;

/**
 * Gets the Lucide icon component based on its name.
 * @param iconName - The name of the icon.
 * @returns The Lucide icon component (as React.ElementType) or a default icon if not found.
 */
function getIconComponent(iconName: LucideIconName | undefined): React.ElementType {
  if (!iconName) {
    // If no icon name is provided, return the default icon component.
    return DefaultIcon;
  }

  // Attempt to retrieve the icon component from the imported LucideIcons object.
  // Use a type assertion to tell TypeScript that iconName is expected to be a key of LucideIcons.
  const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];

  // Check if the retrieved item is likely a React component (a function or an object with $$typeof symbol).
  // This provides a runtime check and helps TypeScript confirm the type.
  if (typeof IconComponent === 'function' || (typeof IconComponent === 'object' && IconComponent !== null && '$$typeof' in IconComponent)) {
     return IconComponent as React.ElementType;
  }

  // If the icon name exists in LucideIcons but the retrieved value is not a valid component,
  // or if the iconName was provided but didn't match a key in LucideIcons,
  // fall back to the default icon.
  console.warn(`Ícono "${iconName}" no encontrado en LucideIcons o no es un componente válido.`);
  return DefaultIcon;
}

// --- How to use getIconComponent in your Services component ---
// Assuming you have a service object with an 'icon' property like:
// const service = { name: 'Service Name', icon: 'Bell', description: '...' };

// To render the icon, call getIconComponent with the service.icon:
// const IconToRender = getIconComponent(service.icon);

// Then use IconToRender as a component in your JSX, likely around where you render service details:
// <IconToRender size={24} className="..." />
// or using React.createElement:
// React.createElement(IconToRender, { size: 24, className: "..." })

// Define and export the Services component
export function Services() {
  // TODO: Add your service data and rendering logic here.
  // You can use the getIconComponent helper function to render icons for each service.

  return (
    <div>
      <h2>Servicios</h2> {/* Translated title */}
      {/* Example usage of getIconComponent (replace with your actual data mapping) */}
      {/*
      Mapea tus datos de servicio y renderiza el icono para cada uno.
      {services.map(service => (
        <div key={service.id}>
          <h3>{service.title}</h3>
          <p>{service.description}</p>
          {<getIconComponent(service.iconName) size={24} />} // Ejemplo de renderizado
        </div>
      ))}
      */}
      <p>El contenido de los servicios va aquí.</p> {/* Translated placeholder */}
    </div>
  );
}
