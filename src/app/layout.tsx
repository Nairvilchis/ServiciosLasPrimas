import type {Metadata} from 'next';
import { Geist } from 'next/font/google'; // Correct import for Geist Sans
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono is not explicitly used, but kept for potential future use
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'Party Planners - Your Event Experts', // Updated title
  description: 'Offering Candy Bars, Custom Cakes, Rentals, Open Bar, and more for your perfect party!', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}> {/* Use font-sans utility */}
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}