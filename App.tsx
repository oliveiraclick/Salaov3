
import React, { useState } from 'react';
import { StoreProvider } from './store';
import { SuperAdmin } from './modules/SuperAdmin';
import { TenantAdmin } from './modules/TenantAdmin';
import { PublicBooking } from './modules/PublicBooking';
import { SaaSLandingPage } from './modules/SaaSLandingPage';
import { SalonDirectory } from './modules/SalonDirectory';
import { Login } from './modules/Login';
import { ProfessionalPanel } from './modules/ProfessionalPanel';

type ViewState = 
  | { type: 'landing' }
  | { type: 'login'; context: 'admin' | 'tenant'; salonId?: string }
  | { type: 'directory' }
  | { type: 'super-admin' }
  | { type: 'tenant'; salonId: string }
  | { type: 'professional'; salonId: string; professionalId: string }
  | { type: 'public'; salonId: string; professionalId?: string }; // Updated with optional deep link param

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>({ type: 'landing' });

  const navigate = (newView: 'tenant' | 'public', salonId: string) => {
    setView({ type: newView, salonId });
  };

  const goHome = () => {
      setView({ type: 'landing' });
  };
  
  const goLoginAdmin = () => {
      setView({ type: 'login', context: 'admin' });
  };

  const goDirectory = () => setView({ type: 'directory' });

  // Special flow for Secret Admin Access from Public Page (Tenant Context)
  const handleSecretTenantAccess = (salonId: string) => {
      setView({ type: 'login', context: 'tenant', salonId });
  };

  switch (view.type) {
    case 'landing':
      return <SaaSLandingPage onEnterSystem={goLoginAdmin} onViewDirectory={goDirectory} />;
    case 'login':
      return (
        <Login 
            context={view.context}
            salonId={view.salonId}
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
            onBack={goHome}
        />
      );
    case 'directory':
      return <SalonDirectory 
          onBack={goHome} 
          onSelectSalon={(id) => navigate('public', id)} 
          onAdminAccess={handleSecretTenantAccess}
      />;
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
        onBack={() => setView({ type: 'directory' })} 
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
