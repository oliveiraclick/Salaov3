
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Button, AppShell, MobileNav, MobileNavItem, Badge, Modal, Input } from '../components/UI';
import { Calendar, Clock, MapPin, CheckCircle, User, ChevronLeft, Scissors, Lock, Home, Globe, Instagram, Facebook, MessageCircle, ShoppingBag, Plus, Minus, Trash2, Image, Search, Edit } from 'lucide-react';
import { Service, Professional, Product } from '../types';

export const PublicBooking: React.FC<{ 
  salonId: string; 
  professionalId?: string; // Optional Deep Link Param
  fromPortal?: boolean; // If true, behaves like the "Agenda" tab of the Client Portal
  clientPhone?: string; // If from portal, pass the logged user phone
  onBack: () => void; 
  onAdminAccess: (salonId: string) => void; 
}> = ({ salonId, professionalId, fromPortal, clientPhone: portalClientPhone, onBack, onAdminAccess }) => {
  const { salons, addAppointment, saveClient, getClientByPhone } = useStore();
  const salon = salons.find(s => s.id === salonId);

  // If from Portal, start at step 1 (Services), otherwise step 0 (Profile)
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(fromPortal ? 1 : 0); 
  const [clientView, setClientView] = useState<'home' | 'gallery' | 'about'>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // E-commerce State
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>([]);
  
  // Client Identification State
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientBirthDate, setClientBirthDate] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientVerified, setClientVerified] = useState(false);
  const [isEditingData, setIsEditingData] = useState(false); // New state for editing pre-filled data

  // My Appointments State
  const [isMyApptsOpen, setIsMyApptsOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [myFoundAppts, setMyFoundAppts] = useState<any[]>([]);

  // Scroll Ref
  const confirmBtnRef = useRef<HTMLDivElement>(null);

  // Handle Deep Link & Portal Phone
  useEffect(() => {
      if (professionalId && salon) {
          const pro = salon.professionals.find(p => p.id === professionalId);
          if (pro) {
              setSelectedProfessional(pro);
          }
      }
      
      if (fromPortal && portalClientPhone) {
          setClientPhone(portalClientPhone);
          // Trigger verification immediately for portal users
          const existingClient = getClientByPhone(portalClientPhone);
          if (existingClient) {
              setClientName(existingClient.name);
              setClientBirthDate(existingClient.birthDate);
              setClientVerified(true);
              setIsNewClient(false);
          }
      }
  }, [professionalId, salon, fromPortal, portalClientPhone]);

  // Auto Scroll Effect
  useEffect(() => {
      if (step === 3 && (clientVerified || (fromPortal && !isEditingData))) {
          // Give a small delay for render to complete
          const timer = setTimeout(() => {
              confirmBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
          return () => clearTimeout(timer);
      }
  }, [clientVerified, fromPortal, isEditingData, step]);

  if (!salon) return <div>Salão não encontrado</div>;

  const productsForSale = salon.products?.filter(p => p.isForSale && p.quantity > 0) || [];

  const addToCart = (product: Product) => {
      setCart([...cart, product]);
  };

  const removeFromCart = (index: number) => {
      const newCart = [...cart];
      newCart.splice(index, 1);
      setCart(newCart);
  };

  const cartTotal = cart.reduce((acc, p) => acc + (p.salePrice || 0), 0);
  const finalTotal = (selectedService?.price || 0) + cartTotal;

  const generateTimeSlots = () => {
      if (!selectedDate || !salon.openTime || !salon.closeTime) return [];
      const start = parseInt(salon.openTime.split(':')[0]) * 60 + parseInt(salon.openTime.split(':')[1]);
      const end = parseInt(salon.closeTime.split(':')[0]) * 60 + parseInt(salon.closeTime.split(':')[1]);
      const interval = salon.slotInterval || 30;
      
      const now = new Date();
      // Safe string comparison for local date to avoid timezone issues
      // Get current date in YYYY-MM-DD format based on user's local time
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayString = `${year}-${month}-${day}`;
      
      const isToday = selectedDate === todayString;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const slots = [];
      for (let time = start; time < end; time += interval) {
          // Check if time has passed if it's today
          // Add a small buffer (e.g., 15 mins) so user doesn't see a slot that is literally "now"
          if (isToday && time <= currentMinutes + 15) {
              continue;
          }

          const hours = Math.floor(time / 60);
          const minutes = time % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          const isBlocked = salon.blockedPeriods?.some(block => {
              if (block.date !== selectedDate) return false;
              if (block.professionalId && block.professionalId !== selectedProfessional?.id) return false;
              return true;
          });

          if (!isBlocked) slots.push(timeString);
      }
      return slots;
  };

  const timeSlots = generateTimeSlots();

  // Helper for Date Mask (DD/MM/YYYY)
  const handleBirthDateChange = (val: string) => {
      let v = val.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      
      if (v.length > 4) {
          v = `${v.slice(0,2)}/${v.slice(2,4)}/${v.slice(4)}`;
      } else if (v.length > 2) {
          v = `${v.slice(0,2)}/${v.slice(2)}`;
      }
      setClientBirthDate(v);
  };

  const handleVerifyPhone = () => {
    // Basic cleanup
    const cleanPhone = clientPhone.replace(/\D/g, '');
    
    if (cleanPhone.length >= 8) {
        const existingClient = getClientByPhone(cleanPhone);
        if (existingClient) {
            setClientName(existingClient.name);
            setClientBirthDate(existingClient.birthDate);
            setIsNewClient(false);
            setClientVerified(true);
        } else if (cleanPhone.length >= 10) {
            setIsNewClient(true);
            setClientVerified(true);
        }
    }
  };

  // Real-time phone check (Only if not from portal, or if user is editing)
  useEffect(() => {
      if (!fromPortal || isEditingData) {
          handleVerifyPhone();
      }
  }, [clientPhone, isEditingData]);

  const handleBooking = () => {
    if (selectedService && selectedProfessional && selectedDate && selectedTime && clientName && clientPhone) {
      if (isNewClient || isEditingData) {
          saveClient({
              id: Math.random().toString(36).substr(2, 9),
              name: clientName,
              phone: clientPhone,
              birthDate: clientBirthDate
          });
      }
      const finalDate = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      addAppointment(salon.id, {
        id: Math.random().toString(36).substr(2, 9),
        salonId: salon.id,
        serviceId: selectedService.id,
        professionalId: selectedProfessional.id,
        clientName: clientName,
        clientPhone: clientPhone,
        date: finalDate,
        status: 'scheduled',
        price: selectedService.price,
        products: cart // Pass the cart items to the appointment
      });
      
      // Ensure we move to step 4
      setStep(4);
      window.scrollTo(0,0);
    }
  };

  const handleLookupAppointments = () => {
      if (!lookupPhone) return;
      const found = salon.appointments
        .filter(a => a.clientPhone === lookupPhone && a.status !== 'cancelled')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setMyFoundAppts(found);
  };

  const handleServiceSelect = (svc: Service) => {
      setSelectedService(svc);
      if (selectedProfessional) {
          // If Deep Linked or pre-selected, skip pro selection
          setStep(3);
      } else {
          setStep(2);
      }
  };

  const handleTimeSelect = (time: string) => {
      setSelectedTime(time);
      if (productsForSale.length > 0) {
          setIsStoreOpen(true);
      }
  };

  const renderBottomNav = () => {
      if (fromPortal) {
          // Portal Mode: Consistent with ClientPortal Dashboard
          return (
            <MobileNav>
                <MobileNavItem 
                    icon={<Home />} 
                    label="Home" 
                    onClick={onBack} // Returns to Dashboard
                />
                <MobileNavItem 
                    icon={<Calendar />} 
                    label="Agenda" 
                    active={true}
                    onClick={() => {}} 
                />
                <MobileNavItem 
                    icon={<User />} 
                    label="Perfil" 
                    onClick={onBack} // Returns to Dashboard where profile is accessible
                />
            </MobileNav>
          );
      } else {
          // Public Mode: Standalone navigation
          return (
            <MobileNav>
                <MobileNavItem 
                    icon={<Home />} 
                    label="Início" 
                    active={step === 0 && clientView === 'home'} 
                    onClick={() => { setStep(0); setClientView('home'); }} 
                />
                <MobileNavItem 
                    icon={<Image />} 
                    label="Galeria" 
                    active={step === 0 && clientView === 'gallery'} 
                    onClick={() => { setStep(0); setClientView('gallery'); }} 
                />
                <MobileNavItem 
                    icon={<MapPin />} 
                    label="Sobre" 
                    active={step === 0 && clientView === 'about'} 
                    onClick={() => { setStep(0); setClientView('about'); }} 
                />
                <MobileNavItem 
                    icon={<Calendar />} 
                    label="Agendar" 
                    active={step > 0} 
                    onClick={() => { if(step === 0) setStep(1); }} 
                />
            </MobileNav>
          );
      }
  };

  const Header = (
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-30 relative">
          {/* Back Button Logic */}
          {(step > 0 && step < 4 && !fromPortal) || (step > 1 && fromPortal) ? (
              <button onClick={() => setStep(step - 1 as any)} className="p-2 -ml-2 text-gray-600 rounded-full active:bg-gray-100">
                 <ChevronLeft className="w-6 h-6" />
              </button>
          ) : (
              // Spacer or Back to Portal if applicable
              fromPortal ? (
                  <button onClick={onBack} className="p-2 -ml-2 text-gray-600 rounded-full active:bg-gray-100">
                     <ChevronLeft className="w-6 h-6" />
                  </button>
              ) : (
                  <div className="w-10"></div>
              )
          )}
          
          {/* Lock Icon Logic: Only available in this header within the salon context, hidden if in portal mode to avoid confusion */}
          {!fromPortal && (
              <button 
                 className="relative flex-shrink-0 group"
                 onClick={() => onAdminAccess(salon.id)}
                 title="Acesso do Proprietário"
              >
                   <div className="w-12 h-12 bg-brand-100 rounded-full overflow-hidden border-2 border-white shadow-md">
                       {salon.coverImage ? (
                            <img src={salon.coverImage} className="w-full h-full object-cover" />
                       ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold text-lg">
                                {salon.name[0]}
                            </div>
                       )}
                   </div>
                   
                   <div className="absolute -bottom-1 -right-1 z-50">
                       <div className="bg-white rounded-full p-0.5 shadow-lg border border-gray-100">
                           <div className="bg-gray-900 p-1.5 rounded-full hover:bg-black transition-colors">
                                <Lock className="w-3 h-3 text-white" />
                           </div>
                       </div>
                   </div>
              </button>
          )}
          
          <div className="flex-1 min-w-0">
               <h1 className="font-bold text-gray-900 truncate text-base leading-tight">{salon.name}</h1>
               {fromPortal && <span className="text-xs text-brand-600 font-bold">Agendamento</span>}
               {selectedProfessional && step > 0 && step < 4 && (
                   <div className="text-xs font-bold text-brand-600 flex items-center gap-1 animate-pulse">
                       Agendando com {selectedProfessional.name}
                   </div>
               )}
          </div>
      </div>
  );

  return (
    <AppShell
        header={Header}
        bottomNav={renderBottomNav()}
    >
        <div className={`p-4 ${step === 0 ? 'pb-24' : 'pb-8'}`}>
            
            {/* Step 0: Salon Showcase / Profile */}
            {step === 0 && (
                <div className="animate-in fade-in duration-500">
                    {clientView === 'home' && (
                        <div className="space-y-6">
                            {/* Cover Image */}
                            <div className="w-full h-48 bg-gray-200 rounded-2xl overflow-hidden shadow-inner mb-4 relative">
                                <img 
                                    src={salon.coverImage || `https://picsum.photos/seed/${salon.id}/800/400`} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                     <div className="text-white">
                                         <h2 className="text-2xl font-bold">{salon.name}</h2>
                                         <p className="text-sm opacity-90 flex items-center gap-1">
                                             <MapPin className="w-3 h-3" /> {salon.address}
                                         </p>
                                     </div>
                                </div>
                            </div>

                            <Button className="w-full py-3 text-lg font-bold shadow-brand-500/20 shadow-lg" onClick={() => setStep(1)}>
                                Agendar Agora
                            </Button>

                            {/* About Us Preview */}
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-2">Bem-vindo</h3>
                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                    {salon.aboutUs || "Bem-vindo ao nosso espaço! Oferecemos os melhores serviços para cuidar da sua beleza e bem-estar."}
                                </p>
                            </div>

                            {/* My Appointments Lookup Button */}
                            <div 
                                onClick={() => setIsMyApptsOpen(true)}
                                className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-full">
                                        <Search className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-blue-900 text-sm">Meus Agendamentos</div>
                                        <div className="text-xs text-blue-600">Esqueceu o horário? Consulte aqui.</div>
                                    </div>
                                </div>
                                <div className="bg-white p-1 rounded-full text-blue-500">
                                    <ChevronLeft className="w-4 h-4 rotate-180" />
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="grid grid-cols-4 gap-2">
                                {salon.socials?.whatsapp && (
                                    <a href={`https://wa.me/${salon.socials.whatsapp}`} target="_blank" className="bg-green-50 p-3 rounded-xl flex flex-col items-center gap-1 text-green-700 hover:bg-green-100 transition-colors">
                                        <MessageCircle className="w-6 h-6" />
                                        <span className="text-[10px] font-bold">Whats</span>
                                    </a>
                                )}
                                {salon.socials?.instagram && (
                                    <a href={`https://instagram.com/${salon.socials.instagram.replace('@','')}`} target="_blank" className="bg-purple-50 p-3 rounded-xl flex flex-col items-center gap-1 text-purple-700 hover:bg-purple-100 transition-colors">
                                        <Instagram className="w-6 h-6" />
                                        <span className="text-[10px] font-bold">Insta</span>
                                    </a>
                                )}
                                {salon.socials?.facebook && (
                                    <a href={salon.socials.facebook} target="_blank" className="bg-blue-50 p-3 rounded-xl flex flex-col items-center gap-1 text-blue-700 hover:bg-blue-100 transition-colors">
                                        <Facebook className="w-6 h-6" />
                                        <span className="text-[10px] font-bold">Face</span>
                                    </a>
                                )}
                                {salon.socials?.website && (
                                    <a href={salon.socials.website} target="_blank" className="bg-gray-50 p-3 rounded-xl flex flex-col items-center gap-1 text-gray-700 hover:bg-gray-100 transition-colors">
                                        <Globe className="w-6 h-6" />
                                        <span className="text-[10px] font-bold">Site</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {clientView === 'gallery' && (
                        <div className="space-y-4">
                             <h2 className="text-xl font-bold text-gray-900 mb-2">Galeria</h2>
                             {salon.gallery && salon.gallery.length > 0 ? (
                                 <div className="grid grid-cols-2 gap-2">
                                     {salon.gallery.map((img, i) => (
                                         <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                                             <img src={img} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl">
                                     <Image className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                     <p>Nenhuma foto na galeria.</p>
                                 </div>
                             )}
                        </div>
                    )}

                    {clientView === 'about' && (
                        <div className="space-y-6">
                             <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre Nós</h2>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {salon.aboutUs || "Descrição não informada."}
                                </p>
                             </div>

                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-brand-500" /> Endereço
                                </h3>
                                <p className="text-sm text-gray-600">{salon.address}</p>
                                {/* Fake Map */}
                                <div className="mt-3 h-32 bg-gray-200 rounded-lg w-full flex items-center justify-center text-gray-400 text-xs">
                                    Mapa Simulado
                                </div>
                             </div>

                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-brand-500" /> Horário de Funcionamento
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Segunda a Sexta</span>
                                        <span className="font-bold text-gray-900">{salon.openTime} - {salon.closeTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sábado</span>
                                        <span className="font-bold text-gray-900">{salon.openTime} - 16:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Domingo</span>
                                        <span className="text-red-500 font-bold">Fechado</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            )}

            {/* Progress Bar for Booking Steps */}
            {step > 0 && step < 4 && (
                <div className="flex gap-2 mb-6 px-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= i ? 'bg-brand-600' : 'bg-gray-200'}`} />
                    ))}
                </div>
            )}

            {step === 1 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Escolha o Serviço</h2>
                    <div className="space-y-3">
                        {salon.services.map(svc => (
                            <div 
                                key={svc.id}
                                onClick={() => handleServiceSelect(svc)}
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center active:scale-[0.98] transition-transform"
                            >
                                <div>
                                    <h4 className="font-bold text-gray-800">{svc.name}</h4>
                                    <span className="text-xs text-gray-500">{svc.durationMinutes} min</span>
                                </div>
                                <span className="font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded text-sm">
                                    R$ {svc.price.toFixed(0)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                     <h2 className="text-xl font-bold text-gray-900 mb-4">Escolha o Profissional</h2>
                     <div className="grid grid-cols-2 gap-3">
                        <div 
                             onClick={() => { setSelectedProfessional(salon.professionals[0]); setStep(3); }}
                             className="bg-white p-4 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center gap-2 active:bg-gray-50"
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                <User className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Qualquer um</span>
                        </div>
                        {salon.professionals.map(pro => (
                            <div 
                                key={pro.id}
                                onClick={() => { setSelectedProfessional(pro); setStep(3); }}
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-2 active:scale-[0.98] transition-transform"
                            >
                                <img src={pro.avatarUrl} alt={pro.name} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">{pro.name}</h4>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
                     <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Data e Hora</h2>
                        {/* Fix: Optimized Date Input for Mobile */}
                        <div className="relative mb-4">
                            <input 
                                type="date" 
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white font-medium text-gray-900 outline-none focus:border-brand-500 appearance-none min-h-[50px]"
                                value={selectedDate}
                                onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                                style={{ WebkitAppearance: 'none' }}
                            />
                        </div>
                        
                        {timeSlots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {timeSlots.map(time => (
                                    <button
                                        key={time}
                                        onClick={() => handleTimeSelect(time)}
                                        className={`py-2 rounded-lg text-sm font-bold border transition-colors ${selectedTime === time ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            selectedDate && <div className="text-sm text-center text-gray-400 py-4">Sem horários disponíveis.</div>
                        )}
                     </div>

                     {/* Store Modal */}
                     <Modal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} title="Lojinha do Salão">
                         <div className="space-y-4">
                             <div className="bg-brand-50 p-3 rounded-lg text-sm text-brand-800">
                                 Aproveite e leve produtos profissionais para casa!
                             </div>
                             
                             <div className="space-y-3">
                                 {productsForSale.map(prod => (
                                     <div key={prod.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                         <div className="flex items-center gap-3">
                                             <img src={prod.image || 'https://via.placeholder.com/100'} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                             <div>
                                                 <div className="font-bold text-sm text-gray-900">{prod.name}</div>
                                                 <div className="text-xs text-brand-600 font-bold">R$ {prod.salePrice?.toFixed(2)}</div>
                                             </div>
                                         </div>
                                         <Button onClick={() => addToCart(prod)} className="px-3 py-1 text-xs">Adicionar</Button>
                                     </div>
                                 ))}
                             </div>

                             {cart.length > 0 && (
                                 <div className="border-t border-gray-100 pt-4 mt-4">
                                     <h4 className="font-bold text-sm mb-2">Seu Carrinho</h4>
                                     {cart.map((item, idx) => (
                                         <div key={idx} className="flex justify-between items-center text-sm py-1">
                                             <span>{item.name}</span>
                                             <div className="flex items-center gap-2">
                                                 <span>R$ {item.salePrice?.toFixed(2)}</span>
                                                 <button onClick={() => removeFromCart(idx)} className="text-red-500"><Trash2 className="w-3 h-3" /></button>
                                             </div>
                                         </div>
                                     ))}
                                     <div className="flex justify-between font-bold mt-2 pt-2 border-t border-dashed border-gray-200">
                                         <span>Total Produtos</span>
                                         <span>R$ {cartTotal.toFixed(2)}</span>
                                     </div>
                                 </div>
                             )}

                             <Button className="w-full" onClick={() => setIsStoreOpen(false)}>Concluir Seleção</Button>
                         </div>
                     </Modal>

                     {selectedTime && (
                         <div className="animate-in fade-in slide-in-from-bottom-4">
                             <h2 className="text-xl font-bold text-gray-900 mb-2">Seus Dados</h2>
                             
                             {fromPortal && clientVerified && !isEditingData ? (
                                 <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4">
                                     <div className="flex justify-between items-start mb-2">
                                         <span className="text-sm font-bold text-gray-500 uppercase">Confirmar Dados</span>
                                         <button onClick={() => setIsEditingData(true)} className="text-brand-600 text-xs font-bold flex items-center gap-1">
                                             <Edit className="w-3 h-3" /> Editar
                                         </button>
                                     </div>
                                     <div className="font-bold text-gray-900 text-lg">{clientName}</div>
                                     <div className="text-gray-600">{clientPhone}</div>
                                 </div>
                             ) : (
                                <>
                                    <input 
                                        type="tel" 
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none mb-3"
                                        placeholder="Seu Telefone (DDD + Número)"
                                        value={clientPhone}
                                        onChange={(e) => { setClientPhone(e.target.value); setClientVerified(false); }}
                                    />
                                </>
                             )}

                             {(clientVerified || (fromPortal && !isEditingData)) && (
                                 <div className="space-y-3">
                                     {(isNewClient || isEditingData) ? (
                                        <>
                                            <input 
                                                type="text" 
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none" 
                                                placeholder="Seu Nome Completo" 
                                                value={clientName} 
                                                onChange={(e) => setClientName(e.target.value)} 
                                            />
                                            {/* Fix: Text Input for Birth Date with Mask */}
                                            <input 
                                                type="tel" 
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none" 
                                                placeholder="Data de Nascimento (DD/MM/AAAA)"
                                                value={clientBirthDate}
                                                maxLength={10}
                                                onChange={(e) => handleBirthDateChange(e.target.value)} 
                                            />
                                        </>
                                     ) : (
                                         !fromPortal && (
                                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Olá, {clientName}!
                                            </div>
                                         )
                                     )}
                                     
                                     <div className="bg-gray-50 p-4 rounded-xl mt-4 space-y-2">
                                         <div className="flex justify-between text-sm">
                                             <span className="text-gray-500">Serviço</span>
                                             <span className="font-bold">R$ {selectedService?.price.toFixed(2)}</span>
                                         </div>
                                         {cart.length > 0 && (
                                             <div className="flex justify-between text-sm text-gray-600">
                                                 <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Produtos ({cart.length})</span>
                                                 <span>R$ {cartTotal.toFixed(2)}</span>
                                             </div>
                                         )}
                                         <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                                             <span>Total</span>
                                             <span className="text-brand-600">R$ {finalTotal.toFixed(2)}</span>
                                         </div>
                                     </div>

                                     {/* Add ref for scroll targeting */}
                                     <div ref={confirmBtnRef}>
                                         <Button className="w-full py-4 text-lg font-bold shadow-xl shadow-brand-200" onClick={handleBooking}>
                                             Confirmar Agendamento
                                         </Button>
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}
                </div>
            )}

            {step === 4 && (
                <div className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-4 text-center animate-in zoom-in-95">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
                    <p className="text-gray-600 mb-8 max-w-xs mx-auto text-lg">
                        Te esperamos dia <span className="font-bold">{new Date(selectedDate + 'T00:00:00').toLocaleDateString()}</span> às <span className="font-bold">{selectedTime}</span>.
                    </p>
                    <div className="w-full max-w-xs space-y-3">
                         <Button className="w-full py-3" onClick={() => {
                            if (fromPortal) {
                                onBack();
                            } else {
                                setStep(0); setSelectedService(null); setSelectedProfessional(null); setSelectedDate(''); setSelectedTime(''); setCart([]); setClientView('home');
                            }
                        }}>
                            Voltar ao Início
                        </Button>
                    </div>
                </div>
            )}

            {/* My Appointments Lookup Modal */}
            <Modal isOpen={isMyApptsOpen} onClose={() => setIsMyApptsOpen(false)} title="Meus Agendamentos">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Digite seu telefone para ver seus próximos horários neste salão.</p>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Telefone (DDD+Número)" 
                            value={lookupPhone}
                            onChange={(e) => setLookupPhone(e.target.value)}
                            className="mb-0"
                        />
                        <Button onClick={handleLookupAppointments}><Search className="w-4 h-4" /></Button>
                    </div>

                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                        {myFoundAppts.length > 0 ? (
                            myFoundAppts.map(app => (
                                <div key={app.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                    <div className="font-bold text-gray-900">
                                        {new Date(app.date).toLocaleDateString()} às {new Date(app.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {salon.services.find(s => s.id === app.serviceId)?.name}
                                    </div>
                                    <div className="text-xs text-brand-600 font-medium mt-1">
                                        Com {salon.professionals.find(p => p.id === app.professionalId)?.name}
                                    </div>
                                </div>
                            ))
                        ) : (
                           lookupPhone && <div className="text-center text-sm text-gray-400 py-4">Nenhum agendamento futuro encontrado.</div>
                        )}
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setIsMyApptsOpen(false)}>Fechar</Button>
                </div>
            </Modal>
        </div>
    </AppShell>
  );
};
