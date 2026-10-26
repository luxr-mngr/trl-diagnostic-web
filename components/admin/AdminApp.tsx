import React from 'react';
import { ClerkLoaded, ClerkLoading, ClerkProvider, Show, SignIn, SignUp, UserButton } from '@clerk/react';
import { esMX } from '@clerk/localizations';
import AdminDashboard from './AdminDashboard';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Clerk invitation links carry this ticket. Only an invited person can create an
// account, and only through that link: open sign-up is disabled in Clerk.
const hasInvitationTicket = new URLSearchParams(window.location.search).has('__clerk_ticket');

const hideFooterLinks = { elements: { footerAction: { display: 'none' } } };

const AdminHeader = () => (
  <header className="w-full border-b border-slate-300 bg-white">
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="bg-[#B2CCE8] rounded-full px-4 py-1.5 flex items-center gap-2 shrink-0">
          <svg className="w-5 h-5 text-[#003B91]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" />
          </svg>
          <span className="font-bold text-[#003B91] text-sm md:text-base whitespace-nowrap">Calculadora TRL</span>
        </div>
        <span className="text-[#002B5B] font-bold text-base md:text-lg truncate">Administración</span>
      </div>
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <a href="/" className="text-sm font-bold text-[#003B91] hover:underline underline-offset-4 hidden sm:inline">
          Ir a la calculadora
        </a>
        <UserButton />
      </div>
    </div>
  </header>
);

const CenteredMessage: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-white flex items-center justify-center px-6">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-bold text-[#002B5B] mb-3">{title}</h1>
      <div className="text-sm text-black leading-relaxed space-y-2">{children}</div>
    </div>
  </div>
);

const AdminApp: React.FC = () => {
  if (!publishableKey) {
    return (
      <CenteredMessage title="Falta configurar Clerk">
        <p>
          Define <code className="font-mono bg-slate-100 px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> en{' '}
          <code className="font-mono bg-slate-100 px-1 rounded">.env.local</code> y reinicia el servidor de desarrollo.
        </p>
      </CenteredMessage>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} localization={esMX} afterSignOutUrl="/admin">
      <ClerkLoading>
        <CenteredMessage title="Cargando…">
          <p>Preparando el panel de administración.</p>
        </CenteredMessage>
      </ClerkLoading>
      <ClerkLoaded>
        <Show when="signed-out">
          <div className="min-h-screen bg-[#F4F7FA] flex flex-col items-center justify-center px-4 py-10 gap-6">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-[#002B5B]">Panel de administración</h1>
              <p className="text-sm text-black mt-1">
                {hasInvitationTicket
                  ? 'Crea tu contraseña para aceptar la invitación.'
                  : 'Acceso solo para cuentas autorizadas.'}
              </p>
            </div>
            {/* Hash routing avoids needing callback routes on the static host. There is
                no public sign-up: accounts are created only from a backend invitation. */}
            {hasInvitationTicket ? (
              <SignUp routing="hash" appearance={hideFooterLinks} />
            ) : (
              <SignIn routing="hash" appearance={hideFooterLinks} />
            )}
            <a href="/" className="text-sm font-bold text-[#003B91] hover:underline underline-offset-4">
              Volver a la calculadora
            </a>
          </div>
        </Show>
        <Show when="signed-in">
          <div className="min-h-screen bg-[#F4F7FA] flex flex-col">
            <AdminHeader />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
              <AdminDashboard />
            </main>
          </div>
        </Show>
      </ClerkLoaded>
    </ClerkProvider>
  );
};

export default AdminApp;
