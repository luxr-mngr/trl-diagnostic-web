
import React, { useEffect, useState } from 'react';
import { ProjectData } from '../types';
import { ApiError, getProjectRoles, getProjectSectors } from '../services/trlApi';
import BackButton from './BackButton';
import Modal from './Modal';

interface ProjectDataScreenProps {
  onNext: (data: ProjectData) => void;
  onBack: () => void;
}

const useOptionsList = (fetcher: () => Promise<string[]>, fallbackError: string) => {
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    fetcher()
      .then(setOptions)
      .catch((e) => setError(e instanceof ApiError ? e.detail : fallbackError))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  return { options, isLoading, error, reload: load };
};

interface OptionsSelectProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  list: ReturnType<typeof useOptionsList>;
}

const OptionsSelect: React.FC<OptionsSelectProps> = ({ name, value, onChange, placeholder, list }) => (
  <div>
    <select
      name={name} value={value} onChange={onChange}
      disabled={list.isLoading || Boolean(list.error)}
      className="w-full rounded-full border border-black py-3 px-6 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white appearance-none text-black disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <option value="">{list.isLoading ? 'Cargando...' : placeholder}</option>
      {list.options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    {list.error && (
      <div className="mt-2 px-4 flex items-center justify-between gap-3">
        <p className="text-xs text-[#8B1E1E]">{list.error}</p>
        <button
          type="button"
          onClick={list.reload}
          className="text-xs font-bold text-[#003B91] underline underline-offset-2 shrink-0 hover:text-[#00224a]"
        >
          Reintentar
        </button>
      </div>
    )}
  </div>
);

const ProjectDataScreen: React.FC<ProjectDataScreenProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState<ProjectData>({
    name: '', idType: '', idNumber: '', email: '', role: '', organization: '',
    proposalTitle: '', sector: '', summary: '', acceptedTerms: false
  });
  const [showConsentInfo, setShowConsentInfo] = useState(false);

  const roles = useOptionsList(getProjectRoles, 'No se pudo cargar la lista de roles.');
  const sectors = useOptionsList(getProjectSectors, 'No se pudo cargar la lista de rubros.');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const isFormValid = Boolean(
    formData.name.trim() &&
    formData.idType &&
    formData.idNumber.trim() &&
    formData.email.trim() &&
    formData.role &&
    formData.organization.trim() &&
    formData.proposalTitle.trim() &&
    formData.sector.trim() &&
    formData.summary.trim() &&
    formData.acceptedTerms
  );

  return (
    <div className="w-full max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <BackButton onClick={onBack} />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-[#002B5B] mb-2">Datos de tu proyecto</h2>
      <p className="text-black mb-1">Para continuar con el proceso, por favor, completa la información solicitada en cada cuadro.</p>
      <p className="text-black text-xs mb-8">Todos los campos son obligatorios.</p>
      
      <div className="space-y-4">
        <input 
          name="name" value={formData.name} onChange={handleChange}
          placeholder="Nombres y apellidos" 
          className="w-full rounded-full border border-black py-3 px-6 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] transition-all bg-white"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select 
            name="idType" value={formData.idType} onChange={handleChange}
            className="rounded-full border border-black py-3 px-6 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white appearance-none text-black"
          >
            <option value="">Tipo de identificación</option>
            <option value="DNI">DNI</option>
            <option value="CE">C.E.</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
          <input 
            name="idNumber" value={formData.idNumber} onChange={handleChange}
            placeholder="Número de documento" 
            className="rounded-full border border-black py-3 px-6 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white"
          />
        </div>
        
        <input 
          name="email" type="email" value={formData.email} onChange={handleChange}
          placeholder="Correo electrónico" 
          className="w-full rounded-full border border-black py-3 px-6 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white"
        />
        
        <OptionsSelect
          name="role" value={formData.role} onChange={handleChange}
          placeholder="Seleccionar rol en el proyecto" list={roles}
        />

        <input 
          name="organization" value={formData.organization} onChange={handleChange}
          placeholder="Organización" 
          className="w-full rounded-full border border-black py-3 px-6 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white"
        />
        
        <input 
          name="proposalTitle" value={formData.proposalTitle} onChange={handleChange}
          placeholder="Título de propuesta" 
          className="w-full rounded-full border border-black py-3 px-6 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white"
        />
        
        <OptionsSelect
          name="sector" value={formData.sector} onChange={handleChange}
          placeholder="Rubro de tu proyecto" list={sectors}
        />

        <textarea 
          name="summary" value={formData.summary} onChange={handleChange}
          placeholder="Resumen de proyecto" 
          rows={3}
          className="w-full rounded-3xl border border-black py-3 px-6 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white resize-none"
        />
        
        <div className="flex items-start gap-3 py-2">
          <input
            type="checkbox"
            name="acceptedTerms"
            aria-label="Acepto el tratamiento de datos para fines estadísticos y de investigación."
            checked={formData.acceptedTerms}
            onChange={handleChange}
            className="w-5 h-5 mt-0.5 accent-[#00AEEF] cursor-pointer shrink-0"
          />
          <button
            type="button"
            onClick={() => setShowConsentInfo(true)}
            className="text-sm text-left text-black underline decoration-dotted underline-offset-4 hover:text-[#003B91] transition-colors"
          >
            Acepto el tratamiento de datos para fines estadísticos y de investigación.
          </button>
        </div>
      </div>

      <div className="mt-8 md:mt-10 flex justify-center">
        <button
          onClick={() => isFormValid && onNext(formData)}
          disabled={!isFormValid}
          className={`w-full sm:w-auto font-bold py-4 px-8 md:px-12 rounded-full shadow-lg transition-all
            ${isFormValid
              ? 'bg-[#F9B115] hover:bg-[#e09e12] text-white hover:scale-105 active:scale-95'
              : 'bg-slate-300 text-black cursor-not-allowed opacity-70'}`}
        >
          Comenzar Evaluación
        </button>
      </div>

      {showConsentInfo && (
        <Modal title="Tratamiento de datos personales" onClose={() => setShowConsentInfo(false)}>
          <p>
            Los datos que registras en este formulario (nombre, documento, correo, organización y demás
            información del proyecto) se utilizan exclusivamente con fines estadísticos y de investigación
            académica, en el marco del estudio sobre madurez tecnológica (TRL) impulsado por el VRI - PUCP.
          </p>
          <p>
            Tu identidad <span className="font-semibold text-[#003B91]">no se expone</span> cuando alguien
            consulta un resultado con el código de seis caracteres: esa consulta pública solo muestra datos
            del proyecto (organización, título, rubro y resultados), nunca tu nombre, documento, correo o rol.
          </p>
          <p>
            El tratamiento se realiza conforme a la Ley N.º 29733, Ley de Protección de Datos Personales.
            Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (derechos ARCO)
            sobre tus datos escribiendo a la unidad responsable del estudio en la PUCP.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDataScreen;
