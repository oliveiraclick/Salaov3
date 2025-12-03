import React, { useState } from 'react';
import { StoreProvider } from './store';
import { SuperAdmin } from './modules/SuperAdmin';
import { TenantAdmin } from './modules/TenantAdmin';
import { PublicBooking } from './modules/PublicBooking';
import { SaaSLandingPage } from './modules/SaaSLandingPage';
import { SalonDirectory } from './modules/SalonDirectory';

type ViewState = 
  | { type: 'landing' }
  | { type: 'directory' }
  | { type: 'super-admin' }
  | { type: 'tenant'; salonId: string }
  | { type: 'public'; salonId: string };

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>({ type: 'landing' });

  const navigate = (newView: 'tenant' | 'public', salonId: string) => {
    setView({ type: newView, salonId });
  };

  const goBack = () => setView({ type: 'super-admin' });
  const goHome = () => setView({ type: 'landing' });
  const goDirectory = () => setView({ type: 'directory' });

  switch (view.type) {
    case 'landing':
      return <SaaSLandingPage onEnterSystem={() => setView({ type: 'super-admin' })} onViewDirectory={goDirectory} />;
    case 'directory':
      return <SalonDirectory onBack={goHome} onSelectSalon={(id) => navigate('public', id)} />;
    case 'super-admin':
      return <SuperAdmin onNavigate={navigate} onLogout={goHome} />;
    case 'tenant':
      return <TenantAdmin salonId={view.salonId} onBack={goBack} />;
    case 'public':
      return <PublicBooking salonId={view.salonId} onBack={() => setView({ type: 'directory' })} />;
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