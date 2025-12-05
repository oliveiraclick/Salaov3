
import React, { useState } from 'react';
import { useStore } from '../store';
import { AppShell, MobileNav, MobileNavItem, Button, Card } from '../components/UI';
import { LogOut, Calendar, MapPin, User, Home, Clock, MessageCircle, Instagram, Globe, History, CheckCircle, Store, ChevronLeft, ArrowRight, Star, XCircle } from 'lucide-react';

export const ClientPortal: React.FC<{ 
  clientPhone: string;
  onSelectSalon: (salonId: string) => void;
  onLogout: () => void;
}> = ({ clientPhone, onSelectSalon, onLogout }) => {
  const { salons, getClientByPhone, cancelAppointment } = useStore();
  
  // 'list' = Meus Favoritos (Tela Inicial)
  // 'dashboard' = Dentro de um salão específico
  const [viewMode, setViewMode] = useState<'list' | 'dashboard'>('list');
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home'); // Tabs dentro do Dashboard
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  
  const client = getClientByPhone(clientPhone);

  // 1. Identificar Favoritos
  const mySalons = salons.filter(salon => 
    salon.appointments.some(appt => appt.clientPhone === clientPhone)
  );
  // Fallback para Demo se não tiver histórico
  const displaySalons = mySalons.length > 0 ? mySalons : salons;

  const currentSalon = salons.find(s => s.id === selectedSalonId);

  // --- Handlers ---

  const handleEnterSalon = (id: string) => {
      setSelectedSalonId(id);
      setViewMode('dashboard');
      setActiveTab('home');
  };

  const handleBackToFavorites = () => {
      setViewMode('list');
      setSelectedSalonId(null);
  };

  const handleAgendaClick = () => {
      if (selectedSalonId) {
          onSelectSalon(selectedSalonId);
      }
  };

  const handleCancelAppointment = (apptId: string) => {
      if (!currentSalon) return;

      if (currentSalon.allowClientCancellation === false) {
          alert(`O estabelecimento ${currentSalon.name} não permite cancelamentos pelo aplicativo. Por favor, entre em contato diretamente.`);
          return;
      }

      if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
          cancelAppointment(currentSalon.id, apptId);
      }
  };

  // --- Renderers ---

  const renderFavoritesList = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
          <div className="bg-brand-600 p-6 rounded-b-[2rem] -mx-4 -mt-4 shadow-lg mb-6">
              <div className="flex justify-between items-start text-white">
                  <div>
                      <h1 className="text-2xl font-bold">Olá, {client?.name?.split(' ')[0] || 'Visitante'}</h1>
                      <p className="text-brand-100 text-sm">Onde vamos agendar hoje?</p>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="w-5 h-5 text-white" />
                  </div>
              </div>
          </div>

          <div className="px-1">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" /> Favoritos
              </h2>
              <div className="space-y-4">
                  {displaySalons.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => handleEnterSalon(s.id)}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
                      >
                          <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                              <img src={s.coverImage || `https://ui-avatars.com/api/?name=${s.name}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg truncate leading-tight">{s.name}</h3>
                              <p className="text-xs text-gray-500 truncate mb-1">{s.address}</p>
                              <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 uppercase">
                                  {s.category}
                              </div>
                          </div>
                          <div className="bg-brand-50 p-2 rounded-full text-brand-600">
                              <ArrowRight className="w-5 h-5" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
          
          <div className="px-4 py-6">
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50" onClick={onLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
              </Button>
          </div>
      </div>
  );

  const renderSalonDashboard = () => {
      if (!currentSalon) return null;

      // Filter history
      const history = currentSalon.appointments
        .filter(a => a.clientPhone === clientPhone)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (activeTab === 'profile') {
          return (
              <div className="space-y-6 animate-in slide-in-from-right-4 pt-4">
                  <div className="text-center">
                      <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-400 font-bold text-2xl">
                          {client?.name?.[0]}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{client?.name}</h2>
                      <p className="text-sm text-gray-500">{client?.phone}</p>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
                      <div className="p-4 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Visitas neste local</span>
                          <span className="font-bold text-gray-900">{history.length}</span>
                      </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleBackToFavorites}>
                      <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Trocar de Estabelecimento
                  </Button>
              </div>
          );
      }

      return (
          <div className="space-y-8 animate-in fade-in duration-500 pt-2">
              {/* 1. Bem-vindo */}
              <div className="bg-brand-600 text-white p-6 rounded-2xl shadow-lg shadow-brand-200 relative overflow-hidden">
                  <div className="relative z-10">
                      <h2 className="text-xl font-bold mb-1">Bem-vindo(a), {client?.name?.split(' ')[0]}!</h2>
                      <p className="text-brand-100 text-sm mb-4 opacity-90">É ótimo ter você no {currentSalon.name}.</p>
                      
                      <div className="inline-flex bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg items-center gap-2 text-xs font-medium">
                          <Clock className="w-3 h-3" /> Aberto: {currentSalon.openTime} - {currentSalon.closeTime}
                      </div>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                      <Store className="w-32 h-32" />
                  </div>
              </div>

              {/* 2. Sobre Nós */}
              <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 px-1">Sobre Nós</h3>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-600 leading-relaxed">
                      {currentSalon.aboutUs || "Descrição não informada."}
                  </div>
              </div>

              {/* Botão de Ação - MOVIDO PARA CÁ */}
              <div className="pt-2">
                  <Button className="w-full py-4 text-lg font-bold shadow-xl shadow-brand-200" onClick={handleAgendaClick}>
                      Agendar Agora
                  </Button>
              </div>

              {/* 3. Galeria */}
              <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 px-1">Galeria de Fotos</h3>
                  <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 no-scrollbar">
                      {currentSalon.gallery && currentSalon.gallery.length > 0 ? (
                          currentSalon.gallery.map((img, idx) => (
                              <div key={idx} className="flex-shrink-0 w-40 h-40 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                                  <img src={img} className="w-full h-full object-cover" />
                              </div>
                          ))
                      ) : (
                          <div className="w-full py-4 text-center text-gray-400 bg-gray-50 rounded-xl text-xs">Galeria vazia</div>
                      )}
                  </div>
              </div>

              {/* 4. Localização */}
              <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 px-1 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-brand-600" /> Localização
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-sm text-gray-800 font-medium mb-2">{currentSalon.address}</p>
                      <div className="h-32 bg-gray-200 rounded-lg w-full flex items-center justify-center text-gray-400 text-xs font-medium">
                          Mapa
                      </div>
                  </div>
              </div>

              {/* 5. Histórico */}
              <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 px-1 flex items-center gap-2">
                      <History className="w-5 h-5 text-brand-600" /> Histórico
                  </h3>
                  <div className="space-y-3">
                      {history.length > 0 ? (
                          history.slice(0, 3).map(appt => {
                              const isFuture = new Date(appt.date) > new Date();
                              return (
                                <div key={appt.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <div className="font-bold text-gray-800 text-sm">
                                                {currentSalon.services.find(s => s.id === appt.serviceId)?.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(appt.date).toLocaleDateString()} às {new Date(appt.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold ${appt.status === 'completed' ? 'bg-green-100 text-green-700' : (appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}`}>
                                            {appt.status === 'completed' ? 'Concluído' : (appt.status === 'cancelled' ? 'Cancelado' : 'Agendado')}
                                        </div>
                                    </div>
                                    
                                    {/* Cancel Button for Future Scheduled Appointments */}
                                    {isFuture && appt.status === 'scheduled' && (
                                        <div className="pt-2 mt-2 border-t border-gray-50 flex justify-end">
                                            <button 
                                                onClick={() => handleCancelAppointment(appt.id)}
                                                className="text-xs text-red-500 flex items-center gap-1 font-medium hover:text-red-700"
                                            >
                                                <XCircle className="w-3 h-3" /> Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                              );
                          })
                      ) : (
                          <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                              Sem agendamentos recentes.
                          </div>
                      )}
                  </div>
              </div>

              {/* 6. Socials */}
              <div className="flex justify-center gap-6 pt-4 pb-8 border-t border-gray-100">
                  {currentSalon.socials?.whatsapp && (
                      <a href={`https://wa.me/${currentSalon.socials.whatsapp}`} target="_blank" className="flex flex-col items-center gap-1 text-green-600">
                          <div className="bg-green-50 p-3 rounded-full"><MessageCircle className="w-5 h-5" /></div>
                          <span className="text-[10px] font-bold">Whats</span>
                      </a>
                  )}
                  {currentSalon.socials?.instagram && (
                      <a href={`https://instagram.com/${currentSalon.socials.instagram}`} target="_blank" className="flex flex-col items-center gap-1 text-purple-600">
                          <div className="bg-purple-50 p-3 rounded-full"><Instagram className="w-5 h-5" /></div>
                          <span className="text-[10px] font-bold">Insta</span>
                      </a>
                  )}
                  {currentSalon.socials?.website && (
                      <a href={currentSalon.socials.website} target="_blank" className="flex flex-col items-center gap-1 text-blue-600">
                          <div className="bg-blue-50 p-3 rounded-full"><Globe className="w-5 h-5" /></div>
                          <span className="text-[10px] font-bold">Site</span>
                      </a>
                  )}
              </div>
          </div>
      );
  };

  // --- Main Layout ---

  if (viewMode === 'list') {
      return (
          <div className="h-full overflow-y-auto bg-gray-50">
              <div className="p-4 pb-20">
                  {renderFavoritesList()}
              </div>
          </div>
      );
  }

  // Dashboard View
  return (
    <AppShell 
        header={
            <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackToFavorites} className="text-gray-500 hover:text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-gray-900 leading-tight text-sm truncate max-w-[200px]">
                        {currentSalon?.name}
                    </h1>
                </div>
            </div>
        }
        bottomNav={
            <MobileNav>
                <MobileNavItem 
                    icon={<Home />} 
                    label="Home" 
                    active={activeTab === 'home'} 
                    onClick={() => setActiveTab('home')} 
                />
                <MobileNavItem 
                    icon={<Calendar />} 
                    label="Agenda" 
                    // Ação direta
                    onClick={handleAgendaClick} 
                />
                <MobileNavItem 
                    icon={<User />} 
                    label="Perfil" 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')} 
                />
            </MobileNav>
        }
    >
        <div className="p-4">
            {renderSalonDashboard()}
        </div>
    </AppShell>
  );
};
