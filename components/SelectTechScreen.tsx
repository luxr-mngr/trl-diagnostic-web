
import React from 'react';
import { TechnologyType } from '../types';
import { TECH_TYPES } from '../constants';
import BackButton from './BackButton';

interface SelectTechScreenProps {
  onSelect: (tech: TechnologyType) => void;
  onBack: () => void;
}

const SelectTechScreen: React.FC<SelectTechScreenProps> = ({ onSelect, onBack }) => (
  <div className="flex flex-col items-center animate-fadeIn w-full">
    <div className="w-full mb-6 md:mb-8">
      <BackButton onClick={onBack} />
    </div>
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#002B5B] mb-4 text-center">
      Seleccione el Tipo de Tecnología
    </h2>
    <p className="text-base md:text-xl text-black mb-10 md:mb-16 text-center max-w-2xl">
      Cada tipo de tecnología tiene criterios específicos para la evaluación TRL. Elija a la industria que mejor describa su proyecto.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
      {TECH_TYPES.map((tech) => (
        <div key={tech.id} className={`${tech.color} rounded-[30px] md:rounded-[40px] p-1 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-[28px] md:rounded-[38px] p-6 md:p-8 h-full flex flex-col items-center text-center">
            <div className="w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden mb-6 md:mb-8 shadow-md">
              <img src={tech.imageUrl} alt={tech.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[#002B5B] mb-3 md:mb-4">{tech.title}</h3>
            <p className="text-sm md:text-base text-black mb-6 md:mb-8 flex-grow leading-relaxed">{tech.description}</p>
            <button
              onClick={() => onSelect(tech)}
              className="w-full sm:w-auto bg-[#222] text-white font-bold py-3 px-10 md:px-12 rounded-full hover:bg-black transition-all sm:hover:px-16 active:scale-95"
            >
              Evaluar
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SelectTechScreen;
