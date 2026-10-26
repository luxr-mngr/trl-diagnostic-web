
import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
  onLookup: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, onLookup }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center animate-fadeIn">
    <div>
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-8 h-8 md:w-10 md:h-10 text-[#002B5B] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z"/>
        </svg>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#002B5B]">Calculadora TRL</h1>
      </div>
      <p className="text-sm font-medium text-black mb-8 lg:mb-12">
        Esta herramienta se ha hecho realidad gracias al apoyo del VRI - PUCP
      </p>

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#002B5B] leading-[1.1] mb-6 md:mb-8">
        Evalúa el nivel de madurez de tu proyecto
      </h2>

      <p className="text-base md:text-xl text-black leading-relaxed mb-8 md:mb-10 max-w-lg">
        Esta herramienta te guiará más allá de lo tecnológico a través de un proceso estructurado basado en estándares internacionales.
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <button
          onClick={onStart}
          className="w-full sm:w-auto bg-[#F9B115] hover:bg-[#e09e12] text-white font-bold py-4 px-8 md:px-10 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Comenzar Evaluación
        </button>
        <button
          onClick={onLookup}
          className="text-[#003B91] text-sm md:text-base font-bold underline underline-offset-4 decoration-2 decoration-[#00AEEF] hover:text-[#00224a] transition-colors"
        >
          ¿Ya tienes un código? Consulta tu resultado
        </button>
      </div>
    </div>

    <div className="relative group">
      <div className="rounded-[30px] md:rounded-[40px] overflow-hidden shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
          alt="Team working"
          className="w-full h-auto object-cover aspect-[4/3]"
        />
      </div>
      <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-8 h-8 md:w-12 md:h-12 bg-pink-500 rounded-full z-20 animate-bounce"></div>
      <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 w-10 h-10 md:w-16 md:h-16 bg-[#00AEEF] rounded-full z-20"></div>
      <div className="absolute top-1/2 -right-2 md:-right-4 w-5 h-5 md:w-8 md:h-8 bg-[#00AEEF] z-20"></div>
      <div className="absolute bottom-1/4 -left-2 md:-left-4 w-4 h-4 md:w-6 md:h-6 bg-pink-500 z-20"></div>
    </div>
  </div>
);

export default WelcomeScreen;
