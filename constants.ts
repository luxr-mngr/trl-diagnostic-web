
import { TechnologyType } from './types';

export const COLORS = {
  primary: '#002B5B',
  secondary: '#00AEEF',
  accent: '#F9B115',
  highlight: '#E91E63',
  success: '#2ECC71',
  bgLight: '#F4F7FA'
};

export const TECH_TYPES: TechnologyType[] = [
  {
    id: 'medicos',
    title: 'Dispositivos Médicos',
    description: 'Equipos, instrumentos y software para diagnóstico o tratamiento médico.',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
    color: 'bg-[#B2E5F5]',
    questionnaireSlug: 'medical_device'
  },
  {
    id: 'software',
    title: 'Software & IT',
    description: 'Plataformas digitales, algoritmos de IA y sistemas de información complejos.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
    color: 'bg-[#FFE57F]',
    questionnaireSlug: 'software'
  },
  {
    id: 'manufactura',
    title: 'Manufactura Avanzada',
    description: 'Nuevos materiales, procesos industriales y robótica de producción.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    color: 'bg-[#F48FB1]',
    questionnaireSlug: 'manufacturing'
  }
];
