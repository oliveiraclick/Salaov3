import React, { useState } from 'react';
import { useStore } from '../store';
import { Button, Card, Badge } from '../components/UI';
import { Calendar, Clock, MapPin, CheckCircle, ArrowRight, User } from 'lucide-react';
import { Service, Professional } from '../types';

export const PublicBooking: React.FC<{ salonId: string; onBack: () => void }> = ({ salonId, onBack }) => {
  const { salons, addAppointment } = useStore();
  const salon = salons.find(s => s.id === salonId);

  // Booking Flow State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');

  if (!salon) return <div>Salão não encontrado</div>;

  const handleBooking = () => {
    if (selectedService && selectedProfessional && selectedDate && selectedTime && clientName) {
      // Create a mock date combining the two
      const finalDate = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      
      addAppointment(salon.id, {
        id: Math.random().toString(36).substr(2, 9),
        salonId: salon.id,
        serviceId: selectedService.id,
        professionalId: selectedProfessional.id,
        clientName: clientName,
        clientPhone: '000000000',
        date: finalDate,
        status: 'scheduled',
        price: selectedService.price
      });
      setStep(4);
    }
  };

  const Steps = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
            ${step >= i ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}
          `}>
            {i}
          </div>
          {i < 3 && <div className={`w-16 h-1 bg-gray-200 ${step > i ? 'bg-brand-600' : ''}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header / Hero */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                    {salon.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h1 className="font-bold text-gray-900">{salon.name}</h1>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                        <MapPin className="w-3 h-3" />
                        {salon.address}
                    </div>
                </div>
            </div>
            <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 underline">
                Simular outro usuário
            </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {step < 4 && (
             <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{salon.description}</h2>
                <p className="text-gray-500">Agende seu horário em poucos passos.</p>
             </div>
        )}

        <Steps />

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[400px]">
            {step === 1 && (
                <div className="p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-6 text-gray-800">Selecione o Serviço</h3>
                    <div className="space-y-3">
                        {salon.services.map(svc => (
                            <div 
                                key={svc.id}
                                onClick={() => { setSelectedService(svc); setStep(2); }}
                                className="group flex justify-between items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all"
                            >
                                <div>
                                    <h4 className="font-semibold text-gray-800 group-hover:text-brand-700">{svc.name}</h4>
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {svc.durationMinutes} min
                                    </span>
                                </div>
                                <span className="font-bold text-brand-600">R$ {svc.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="p-6 sm:p-8">
                     <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600">Voltar</button>
                        <h3 className="text-xl font-bold text-gray-800">Escolha o Profissional</h3>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {salon.professionals.map(pro => (
                            <div 
                                key={pro.id}
                                onClick={() => { setSelectedProfessional(pro); setStep(3); }}
                                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-all"
                            >
                                <img src={pro.avatarUrl} alt={pro.name} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">{pro.name}</h4>
                                    <span className="text-xs text-gray-500">Especialista</span>
                                </div>
                            </div>
                        ))}
                        <div 
                             onClick={() => { setSelectedProfessional(salon.professionals[0]); setStep(3); }} // Fallback to first for logic simplicity
                             className="flex items-center gap-4 p-4 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-600">Qualquer Profissional</h4>
                                <span className="text-xs text-gray-400">Maior disponibilidade</span>
                            </div>
                        </div>
                     </div>
                </div>
            )}

            {step === 3 && (
                <div className="p-6 sm:p-8">
                     <div className="flex items-center gap-2 mb-6">
                        <button onClick={() => setStep(2)} className="text-sm text-gray-400 hover:text-gray-600">Voltar</button>
                        <h3 className="text-xl font-bold text-gray-800">Data e Hora</h3>
                     </div>
                     
                     <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Seu Nome</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                placeholder="Digite seu nome completo"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                                <input 
                                    type="date" 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                                <select 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    <option value="09:00">09:00</option>
                                    <option value="10:00">10:00</option>
                                    <option value="11:00">11:00</option>
                                    <option value="14:00">14:00</option>
                                    <option value="15:00">15:00</option>
                                    <option value="16:00">16:00</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mt-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Serviço:</span>
                                <span className="font-medium">{selectedService?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Profissional:</span>
                                <span className="font-medium">{selectedProfessional?.name}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                                <span>Total</span>
                                <span>R$ {selectedService?.price.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-12 text-lg"
                            disabled={!selectedDate || !selectedTime || !clientName}
                            onClick={handleBooking}
                        >
                            Confirmar Agendamento
                        </Button>
                     </div>
                </div>
            )}

            {step === 4 && (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Agendado!</h2>
                    <p className="text-gray-600 mb-8 max-w-sm">
                        Seu horário para <b>{selectedService?.name}</b> com <b>{selectedProfessional?.name}</b> foi confirmado para o dia {selectedDate} às {selectedTime}.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => {
                            setStep(1);
                            setSelectedService(null);
                            setSelectedProfessional(null);
                            setSelectedDate('');
                            setSelectedTime('');
                            setClientName('');
                        }}>
                            Agendar Outro
                        </Button>
                        <Button onClick={onBack}>Voltar ao Início</Button>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};
