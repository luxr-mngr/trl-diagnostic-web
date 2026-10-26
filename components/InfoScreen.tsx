
import React from 'react';
import BackButton from './BackButton';
import TrlThermometer from './TrlThermometer';

interface InfoScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const InfoScreen: React.FC<InfoScreenProps> = ({ onNext, onBack }) => (
  <div className="flex flex-col items-center animate-fadeIn w-full">
    <div className="w-full max-w-5xl mb-6 md:mb-8">
      <BackButton onClick={onBack} />
    </div>
    <h2 className="text-3xl md:text-4xl font-black text-[#002B5B] mb-8 md:mb-16 text-center">
      Explora la Calculadora TRL
    </h2>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-stretch w-full max-w-6xl">
      <div className="flex flex-col gap-8">
        <div className="space-y-6">
          <h3 className="text-2xl md:text-3xl font-bold text-[#002B5B] mb-4 md:mb-6">¿Qué es la Calculadora TRL?</h3>
          <p className="text-base md:text-lg text-black leading-relaxed mb-6 md:mb-8">
            Es una escala establecida por la NASA en 1980 y es usada para medir el grado de desarrollo de una tecnología.
            Un nivel refleja el estado actual de la tecnología y proporciona una base para evaluar su madurez y definir su progreso (NASA, 2007).
          </p>

          <ul className="space-y-4">
            {[
              'Evalúa el nivel de madurez de tus proyectos de I+D.',
              'Comunica la madurez de su tecnología a inversores y socios.',
              'Estandariza la evaluación de tecnologías en portafolios de proyectos.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="bg-[#2ECC71] rounded-full p-1 mt-1 shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm md:text-base text-black font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#F4F7FA] rounded-[30px] md:rounded-[40px] p-5 md:p-6 shadow-sm border border-slate-400">
          <h3 className="text-xl md:text-2xl font-bold text-[#002B5B] mb-4 md:mb-5 text-center">¿Para quién es?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
            {[
              { title: 'Investigadores/as', icon: '🔬' },
              { title: 'Gestores/as Tecnológicos', icon: '🌿' },
              { title: 'Equipos Técnicos', icon: '⚙️' },
              { title: 'Empresarios/as', icon: '💼' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-full py-2.5 md:py-3 px-5 md:px-6 flex items-center gap-4 shadow-sm transform transition-all hover:translate-x-2">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <span className="text-sm md:text-base font-semibold text-black">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#F4F7FA] rounded-[30px] md:rounded-[40px] p-4 md:p-5 shadow-sm border border-slate-400 flex flex-col h-full">
        <h3 className="text-xl md:text-2xl font-bold text-[#002B5B] mb-4 md:mb-6 text-center">Escala de Niveles TRL</h3>
        <TrlThermometer />
      </div>
    </div>

    <button
      onClick={onNext}
      className="mt-10 md:mt-16 w-full sm:w-auto bg-[#F9B115] hover:bg-[#e09e12] text-white font-bold py-4 px-10 md:px-12 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
    >
      Continuar
    </button>
  </div>
);

export default InfoScreen;
