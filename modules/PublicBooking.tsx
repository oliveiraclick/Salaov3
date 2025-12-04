
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Button, AppShell, MobileNav, MobileNavItem, Badge, Modal } from '../components/UI';
import { Calendar, Clock, MapPin, CheckCircle, User, ChevronLeft, Scissors, Lock, Home, Globe, Instagram, Facebook, MessageCircle, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Service, Professional, Product } from '../types';

export const PublicBooking: React.FC<{ 
  salonId: string; 
  professionalId?: string; // Optional Deep Link Param
  onBack: () => void;
  onAdminAccess: (salonId: string) => void; 
}> = ({ salonId, professionalId, onBack, onAdminAccess }) => {
  const { salons, addAppointment, saveClient, getClientByPhone } = useStore();
  const salon = salons.find(s => s.id === salonId);

  // Booking Flow State
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0); // 0 = Profile/Showcase
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

  // Handle Deep Link
  useEffect(() => {
      if (professionalId && salon) {
          const pro = salon.professionals.find(p => p.id === professionalId);
          if (pro) {
              setSelectedProfessional(pro);
              // We don't skip step 0, but we will skip step 2 later
          }
      }
  }, [professionalId, salon]);

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
      const slots = [];
      for (let time = start; time < end; time += interval) {
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

  const handleVerifyPhone = () => {
    if (clientPhone.length >= 8) {
        const existingClient = getClientByPhone(clientPhone);
        if (existingClient) {
            setClientName(existingClient.name);
            setClientBirthDate(existingClient.birthDate);
            setIsNewClient(false);
            setClientVerified(true);
        } else {
            setIsNewClient(true);
            setClientVerified(true);
        }
    }
  };

  const handleBooking = () => {
    if (selectedService && selectedProfessional && selectedDate && selectedTime && clientName && clientPhone) {
      if (isNewClient) {
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
      setStep(4);
    }
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

  const Header = (
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-20 relative">
          <button onClick={step === 0 ? onBack : () => setStep(step - 1 as any)} className="p-2 -ml-2 text-gray-600 rounded-full active:bg-gray-100">
             <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
             className="relative flex-shrink-0"
             onClick={() => onAdminAccess(salon.id)}
          >
               <div className="w-10 h-10 bg-brand-50 rounded-full overflow-hidden border border-gray-100">
                   {salon.coverImage ? (
                        <img src={salon.coverImage} className="w-full h-full object-cover" />
                   ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold">
                            {salon.name[0]}
                        </div>
                   )}
               </div>
               {/* Badge Cadeado Fixo e Visível */}
               <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full shadow-sm z-10">
                   <div className="bg-gray-900 p-1.5 rounded-full">
                        <Lock className="w-3 h-3 text-white" />
                   </div>
               </div>
          </button>
          
          <div className="flex-1 min-w-0">
               <h1 className="font-bold text-gray-900 truncate text-base leading-tight">{salon.name}</h1>
               {selectedProfessional && (
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
        bottomNav={
            step === 0 ? (
                // Bottom Nav for Showcase
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 pb-safe-area shadow-2xl z-50">
                    <Button className="w-full py-4 text-lg font-bold shadow-brand-500/30 shadow-lg" onClick={() => setStep(1)}>
                        Agendar Horário
                    </Button>
                </div>
            ) : (
                // Standard Nav for Booking Flow
                <MobileNav>
                    <MobileNavItem icon={<Home />} label="Diretório" active={false} onClick={onBack} />
                    <MobileNavItem icon={<Calendar />} label="Agendar" active={true} onClick={() => {}} />
                    <MobileNavItem icon={<User />} label="Admin" onClick={() => onAdminAccess(salon.id)} />
                </MobileNav>
            )
        }
    >
        <div className={`p-4 ${step === 0 ? 'pb-24' : 'pb-8'}`}>
            
            {/* Step 0: Salon Showcase / Profile */}
            {step === 0 && (
                <div className="space-y-6 animate-in fade-in duration-500">
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

                    {/* About Us */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">Sobre Nós</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {salon.aboutUs || "Bem-vindo ao nosso espaço! Oferecemos os melhores serviços para cuidar da sua beleza e bem-estar."}
                        </p>
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

                    {/* Quick Info */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                         <div className="flex justify-between text-sm mb-2">
                             <span className="text-gray-500">Horário de Hoje</span>
                             <span className="font-bold text-gray-900">{salon.openTime} às {salon.closeTime}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                             <span className="text-gray-500">Profissionais</span>
                             <div className="flex -space-x-2">
                                 {salon.professionals.slice(0, 4).map(p => (
                                     <img key={p.id} src={p.avatarUrl} className="w-6 h-6 rounded-full border border-white" />
                                 ))}
                             </div>
                         </div>
                    </div>
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
                        <input 
                            type="date" 
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white font-medium text-gray-900 outline-none focus:border-brand-500 mb-4"
                            value={selectedDate}
                            onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                        />
                        
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
                             <input 
                                type="tel" 
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none mb-3"
                                placeholder="Seu Telefone"
                                value={clientPhone}
                                onChange={(e) => { setClientPhone(e.target.value); setClientVerified(false); }}
                                onBlur={handleVerifyPhone}
                             />
                             {clientVerified && (
                                 <div className="space-y-3">
                                     {isNewClient ? (
                                        <>
                                            <input type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none" placeholder="Seu Nome" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                                            <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none" value={clientBirthDate} onChange={(e) => setClientBirthDate(e.target.value)} />
                                        </>
                                     ) : (
                                         <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                                             <CheckCircle className="w-4 h-4" /> Olá, {clientName}!
                                         </div>
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

                                     <Button className="w-full py-4 text-lg font-bold shadow-xl shadow-brand-200" onClick={handleBooking}>
                                         Confirmar Agendamento
                                     </Button>
                                 </div>
                             )}
                         </div>
                     )}
                </div>
            )}

            {step === 4 && (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmado!</h2>
                    <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                        Te esperamos dia {new Date(selectedDate).toLocaleDateString()} às {selectedTime}.
                    </p>
                    <Button variant="outline" onClick={() => {
                        setStep(0); setSelectedService(null); setSelectedProfessional(null); setSelectedDate(''); setSelectedTime(''); setCart([]);
                    }}>
                        Novo Agendamento
                    </Button>
                </div>
            )}
        </div>
    </AppShell>
  );
};
