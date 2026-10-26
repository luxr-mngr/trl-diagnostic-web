import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/react';
import { Check, Copy, ShieldAlert } from 'lucide-react';
import AssessmentsPanel from './AssessmentsPanel';
import { AdminApiError, EMPTY_FILTERS, useAdminApi } from './adminApi';

type Access = 'checking' | 'granted' | 'forbidden';

/**
 * Shown when Clerk signed the user in but the backend's allowlist
 * (ADMIN_CLERK_USER_IDS) doesn't include them. The user ID is what the
 * backend team needs to grant access, and Clerk's UI doesn't display it.
 */
const NotAuthorized: React.FC<{ userId: string | null | undefined; onRetry: () => void }> = ({ userId, onRetry }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the ID is still selectable on screen.
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-6 bg-white rounded-[24px] border border-slate-400 shadow-sm p-6 md:p-8 text-black">
      <div className="flex items-center gap-3 mb-3">
        <ShieldAlert className="w-7 h-7 text-[#8B1E1E] shrink-0" />
        <h2 className="text-xl md:text-2xl font-bold text-[#002B5B]">Cuenta sin permisos de administración</h2>
      </div>
      <p className="text-sm leading-relaxed mb-5">
        Iniciaste sesión correctamente, pero esta cuenta todavía no está autorizada para ver el panel. Envía tu ID de usuario
        al equipo de backend para que lo agreguen a la lista de administradores.
      </p>
      <p className="text-[11px] font-bold uppercase tracking-wide mb-1">Tu ID de usuario</p>
      <div className="flex items-center gap-2 mb-5">
        <code className="flex-1 min-w-0 select-all break-all rounded-full bg-[#F4F7FA] border border-slate-400 px-4 py-2 font-mono text-sm">
          {userId ?? '—'}
        </code>
        <button
          onClick={copy}
          disabled={!userId}
          className="shrink-0 flex items-center gap-1.5 rounded-full bg-[#003B91] hover:bg-[#00224a] text-white font-bold text-sm px-4 py-2 transition-colors disabled:opacity-50"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <button
        onClick={onRetry}
        className="rounded-full border-2 border-slate-400 text-black font-bold text-sm px-5 py-1.5 hover:border-[#003B91] hover:text-[#003B91] transition-colors"
      >
        Ya me autorizaron, reintentar
      </button>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { userId } = useAuth();
  const { listAssessments } = useAdminApi();
  const [access, setAccess] = useState<Access>('checking');

  // One cheap authenticated call up front, so a non-allowlisted account sees a
  // single explanation instead of the panel failing with a generic error.
  const checkAccess = useCallback(async () => {
    setAccess('checking');
    try {
      await listAssessments(EMPTY_FILTERS, null, 1);
      setAccess('granted');
    } catch (e) {
      // Other failures (network, 5xx) are left for the panel to report and retry.
      setAccess(e instanceof AdminApiError && e.status === 403 ? 'forbidden' : 'granted');
    }
  }, [listAssessments]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  if (access === 'checking') {
    return <p className="py-16 text-center text-sm font-bold text-black">Verificando permisos…</p>;
  }

  if (access === 'forbidden') {
    return <NotAuthorized userId={userId} onRetry={checkAccess} />;
  }

  return <AssessmentsPanel />;
};

export default AdminDashboard;
