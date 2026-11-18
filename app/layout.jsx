import "./globals.css";

export const metadata = {
  title: "love, mave | Ceramic mugs",
  description: "Explore the love, mave ceramic mug collection.",
};

export const viewport = { viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-motion="">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=Playfair+Display:ital,wght@0,600;0,700;1,600&amp;display=swap" />
      </head>
      <body id="top">{children}</body>
    </html>
  );
}
