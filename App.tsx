
import React, { useState } from 'react';
import { StoreProvider } from './store';
import { SuperAdmin } from './modules/SuperAdmin';
import { TenantAdmin } from './modules/TenantAdmin';
import { PublicBooking } from './modules/PublicBooking';
import { SalonDirectory } from './modules/SalonDirectory';
import { Login } from './modules/Login';
import { Register } from './modules/Register';
import { ProfessionalPanel } from './modules/ProfessionalPanel';
import { HowItWorks } from './modules/HowItWorks';
import { TermsOfUse } from './modules/TermsOfUse';
import { PrivacyPolicy } from './modules/PrivacyPolicy';
import { ClientPortal } from './modules/ClientPortal';

type ViewState = 
  | { type: 'register' }
  | { type: 'login'; context: 'admin' | 'tenant'; salonId?: string; prefilledEmail?: string }
  | { type: 'directory' }
  | { type: 'super-admin' }
  | { type: 'tenant'; salonId: string }
  | { type: 'professional'; salonId: string; professionalId: string }
  | { type: 'public'; salonId: string; professionalId?: string; fromPortal?: boolean; clientPhone?: string }
  | { type: 'client-portal'; clientPhone: string }
  | { type: 'how-it-works' }
  | { type: 'terms' }
  | { type: 'privacy' };

const AppContent: React.FC = () => {
  // START AT REGISTER
  const [view, setView] = useState<ViewState>({ type: 'register' });

  const navigate = (newView: 'tenant' | 'public', salonId: string) => {
    setView({ type: newView, salonId });
  };

  const goHome = () => {
      // Volta para o login
      setView({ type: 'login', context: 'tenant' });
  };
  
  const goRegister = () => {
      setView({ type: 'register' });
  };

  const goDirectory = () => setView({ type: 'directory' });
  // Although Landing is removed, these pages might still be accessible from Footer/Login if linked, 
  // but for now we keep them reachable via direct state change if needed, or remove completely if external.
  // Assuming Terms/Privacy might still be needed inside the app.
  const goHowItWorks = () => setView({ type: 'how-it-works' });
  const goTerms = () => setView({ type: 'terms' });
  const goPrivacy = () => setView({ type: 'privacy' });

  const handleSecretTenantAccess = (salonId: string) => {
      setView({ type: 'login', context: 'tenant', salonId });
  };

  switch (view.type) {
    case 'register':
      return (
        <Register 
            onLoginRedirect={goHome}
            onSuccess={(email) => setView({ type: 'login', context: 'tenant', prefilledEmail: email })}
        />
      );
    case 'how-it-works':
      return <HowItWorks onBack={goRegister} />;
    case 'terms':
      return <TermsOfUse onBack={goRegister} />;
    case 'privacy':
      return <PrivacyPolicy onBack={goRegister} />;
    case 'login':
      return (
        <Login 
            context={view.context}
            salonId={view.salonId}
            prefilledEmail={view.prefilledEmail}
            onLogin={(id, isPro, proId) => {
                if (view.context === 'tenant' && id) {
                    if (isPro && proId) {
                        setView({ type: 'professional', salonId: id, professionalId: proId });
                    } else {
                        navigate('tenant', id);
                    }
                } else {
                    setView({ type: 'super-admin' });
                }
            }} 
            onClientLogin={(phone) => {
                setView({ type: 'client-portal', clientPhone: phone });
            }}
            onBack={goRegister}
            onRegister={goRegister}
        />
      );
    case 'directory':
      return <SalonDirectory 
          onBack={goHome} 
          onSelectSalon={(id) => navigate('public', id)} 
          onAdminAccess={handleSecretTenantAccess}
      />;
    case 'client-portal':
      return (
        <ClientPortal 
            clientPhone={view.clientPhone}
            onSelectSalon={(id) => setView({ type: 'public', salonId: id, fromPortal: true, clientPhone: view.clientPhone })}
            onLogout={goHome}
        />
      );
    case 'super-admin':
      return <SuperAdmin onNavigate={navigate} onLogout={goHome} />;
    case 'tenant':
      return <TenantAdmin salonId={view.salonId} onBack={goHome} />;
    case 'professional':
      return <ProfessionalPanel salonId={view.salonId} professionalId={view.professionalId} onLogout={goHome} />;
    case 'public':
      return <PublicBooking 
        salonId={view.salonId} 
        professionalId={view.professionalId}
        fromPortal={view.fromPortal}
        clientPhone={view.clientPhone}
        onBack={() => {
            if (view.fromPortal && view.clientPhone) {
                // Return to client portal correctly
                setView({ type: 'client-portal', clientPhone: view.clientPhone }); 
            } else {
                setView({ type: 'directory' });
            }
        }} 
        onAdminAccess={handleSecretTenantAccess}
      />;
    default:
      return <div>Error: Unknown view</div>;
  }
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;