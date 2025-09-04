import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import "./globals.css"

export const metadata = {
  title: 'Car Hub',
  description: 'Discover the best cars in the world.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // dynamic import to inspect runtime shape (helps debug invalid element type)
  const NavbarModule = await import('../components/Navbar');
  const FooterModule = await import('../components/Footer');

  // prefer default export, but fall back to module itself if necessary
  const NavbarComp = (NavbarModule && (NavbarModule as any).default) || NavbarModule;
  const FooterComp = (FooterModule && (FooterModule as any).default) || FooterModule;

  // log shapes to server console for debugging
  // eslint-disable-next-line no-console
  console.log('Navbar module keys:', Object.keys(NavbarModule || {}));
  // eslint-disable-next-line no-console
  console.log('Footer module keys:', Object.keys(FooterModule || {}));

  return (
    <html lang="en">
      <body className="relative">
        {/* render whichever is the component function */}
        {/* @ts-ignore server-side dynamic component */}
        <NavbarComp />
        {children}
        {/* @ts-ignore server-side dynamic component */}
        <FooterComp />
      </body>
    </html>
  );
}