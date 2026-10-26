
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  /** 'default' = plain bold link used on form/selection screens. 'pill' = small muted badge used as a corner note on result screens. */
  variant?: 'default' | 'pill';
}

const VARIANT_CLASSES: Record<NonNullable<BackButtonProps['variant']>, string> = {
  default: 'gap-2 text-[#003B91] font-bold hover:-translate-x-1 transition-transform',
  pill: 'gap-1 bg-white/85 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-black font-bold hover:text-[#003B91] transition-colors'
};

const ICON_SIZE: Record<NonNullable<BackButtonProps['variant']>, string> = {
  default: 'w-5 h-5',
  pill: 'w-3 h-3'
};

const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Atrás', variant = 'default' }) => (
  <button onClick={onClick} className={`flex items-center ${VARIANT_CLASSES[variant]}`}>
    <ArrowLeft className={ICON_SIZE[variant]} /> {label}
  </button>
);

export default BackButton;
