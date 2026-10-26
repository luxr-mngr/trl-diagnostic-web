
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 bg-[#002B5B]/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[25px] md:rounded-[30px] shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 id="modal-title" className="text-xl md:text-2xl font-bold text-[#002B5B]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 text-black hover:text-[#003B91] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="text-sm md:text-base text-black leading-relaxed space-y-3">
          {children}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#003B91] hover:bg-[#00224a] text-white font-bold py-2.5 px-6 rounded-full transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
