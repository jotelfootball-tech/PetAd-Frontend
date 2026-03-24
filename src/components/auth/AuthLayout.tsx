import type { ReactNode } from "react";
import petsHero from "../../assets/pet.png";
import logo from "../../assets/logo.svg"

interface AuthLayoutProps {
  children: ReactNode;
  imageSrc?: string;
  title?: string;
  description?: string;
}

export function AuthLayout({ children, imageSrc = petsHero, title, description }: AuthLayoutProps) {
  return (
    <div className="h-screen flex flex-col md:flex-row p-4 overflow-hidden bg-white">
      {/* ── Left panel — hidden on mobile, visible md+ ── */}
      <div className="hidden md:flex flex-col justify-between w-[40%] max-w-[500px] bg-[#FAD9C1] px-10 pt-10 rounded-[1.5rem] overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <div>
            <p className="font-black text-[18px] leading-none tracking-widest uppercase">
              PETAD
            </p>
            <p className="text-[9px] tracking-[0.5em] uppercase text-black/60">
              Pet Lovers
            </p>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h1 className="font-black text-4xl lg:text-[40px] leading-tight tracking-tight text-black">
            {title || "Connecting Pet Lovers ❤️ For Easier Adoption!"}
          </h1>
          <p className="mt-3 text-sm font-medium text-black/70 max-w-sm leading-relaxed">
            {description || "List your pets for adoption or discover pets/animals listed for adoption by their owners."}
          </p>
        </div>

        {/* Pet image — large, anchored to bottom */}
        <div className="flex justify-center items-end w-full flex-1">
          <img
            src={imageSrc}
            alt="Pets"
            className="w-full object-cover object-bottom drop-shadow-lg"
          />
        </div>
      </div>

      {/* ── Right panel — full width on mobile, flex-1 on md+ ── */}
      <div className="flex flex-1 flex-col items-center justify-center h-full px-6 bg-white overflow-y-auto scrollbar-minimal">
        <div className="w-full max-w-sm py-8">{children}</div>
      </div>
    </div>
  );
}
