
import React from 'react';
import BackgroundShapes from './BackgroundShapes';

interface StepLayoutProps {
  children: React.ReactNode;
  /** Full-width layout for the results dashboard: tighter vertical padding on large screens; the page scrolls normally. */
  fullBleed?: boolean;
}

const StepLayout: React.FC<StepLayoutProps> = ({ children, fullBleed = false }) => {
  return (
    <div className={`min-h-screen ${fullBleed ? 'print:h-auto print:overflow-visible' : ''} bg-white relative overflow-x-clip flex flex-col items-center justify-center px-6 md:px-8 print:block print:px-0`}>
      <BackgroundShapes />
      <div className={`relative z-10 w-full max-w-7xl py-6 pb-20 md:py-4 md:pb-16 flex flex-col items-center justify-center print:py-0 ${fullBleed ? 'lg:py-3 print:h-auto print:overflow-visible' : ''}`}>
        {children}
      </div>

      {/* Bottom Footer Text */}
      <div className="absolute bottom-2 left-0 w-full px-4 md:px-8 text-[9px] text-black text-center pointer-events-none opacity-60 print:hidden">
        *La universidad no asume responsabilidad alguna por la utilización de los resultados de la calculadora. La información proporcionada y el cálculo obtenido son referenciales y su uso no es obligatorio.
      </div>
    </div>
  );
};

export default StepLayout;
