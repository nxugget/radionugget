import "./styles/globals.css";
import { Navbar } from "./components/navbar";
import { ShootingStars } from "./components/ShootingStars";
import { StarsBackground } from "./components/StarsBackground";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative w-full h-screen min-h-screen overflow-hidden bg-black">
        {/* Fond étoilé */}
        <StarsBackground className="absolute top-0 left-0 w-full h-full" />
        <ShootingStars />
        
        {/* Contenu principal */}
        <div className="relative z-10">
          <Navbar />
          <main> 
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
