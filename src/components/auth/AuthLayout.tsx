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
      <div className="hidden md:flex flex-col justify-between md:w-[40%]  bg-[#FAD9C1] md:p-10 2xl:px-15 mb-5 rounded-xl overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 2xl:mb-15">
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
        <div className="max-w-[380px] 2xl:max-w-[476px]">
          <h1 className="md:text-[40px] 2xl:text-[50px] leading-tight tracking-tight text-black font-bold">
            {title || "Connecting Pet Lovers ❣️ For Easier Adoption!"}
          </h1>
          <p className="mt-3 text-[15px] 2xl:text-[20px] font-medium text-black/70  leading-relaxed">
            {description || "List your pets for adoption or discover pets/animals listed for adoption by their owners."}
          </p>
        </div>

        {/* Pet image — large, anchored to bottom */}
        <div className="flex justify-center items-end w-full flex-1">
          <img
            src={imageSrc}
            alt="Pets"
            className="w-full object-cover object-bottom xl:mb-[-50px] drop-shadow-lg"
          />
        </div>
      </div>

      {/* ── Right panel — full width on mobile, flex-1 on md+ ── */}
      <div className="flex  flex-1 flex-col items-center justify-center md:max-w-[60%] max-h-screen bg-white h-full px-6 overflow-y-auto scrollbar-minimal">
        <div className="w-full max-w-sm py-8">{children}</div>
      </div>
    </div>
  );
}
