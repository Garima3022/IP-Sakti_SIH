import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dr. Ayurvedic Sathi | Evidence-First AI & Statutory RAG Platform',
  description: 'AI-assisted research companion for exploring Ayurvedic intellectual property, traditional knowledge, CITES compliance, and statutory regulations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-[#F5F7F2] text-[#1F3329] min-h-screen font-sans antialiased selection:bg-[#245C45] selection:text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
