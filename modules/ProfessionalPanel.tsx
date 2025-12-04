
import React, { useState } from 'react';
import { useStore } from '../store';
import { AppShell, MobileNav, MobileNavItem, Card, Badge, Button, Input, Modal } from '../components/UI';
import { Calendar, User, DollarSign, LogOut, Clock, Ban, ShoppingBag, Plus, CalendarRange } from 'lucide-react';
import { Professional, Appointment } from '../types';

export const ProfessionalPanel: React.FC<{ 
  salonId: string; 
  professionalId: string;
  onLogout: () => void; 
}> = ({ salonId, professionalId, onLogout }) => {
  const { salons, addBlockedPeriod, addAppointment } = useStore();
  const salon = salons.find(s => s.id === salonId);
  const professional = salon?.professionals.find(p => p.id === professionalId);

  const [activeTab, setActiveTab] = useState<'agenda' | 'performance'>('agenda');
  
  // States for Booking
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({ clientName: '', clientPhone: '', serviceId: '', date: '', time: '' });

  // States for Blocking
  const [blockMode, setBlockMode] = useState<'single' | 'range'>('single');
  const [blockDate, setBlockDate] = useState('');
  const [blockRange, setBlockRange] = useState({ start: '', end: '' });

  if (!salon || !professional) return <div>Acesso negado.</div>;

  const myAppointments = salon.appointments.filter(a => a.professionalId === professionalId);
  
  // Calculate Commission breakdown
  const currentMonth = new Date().getMonth();
  const completedAppts = myAppointments.filter(a => a.status === 'completed' && new Date(a.date).getMonth() === currentMonth);
  
  let totalServiceRevenue = 0;
  let totalProductRevenue = 0;

  completedAppts.forEach(appt => {
      const productTotal = appt.products ? appt.products.reduce((acc, p) => acc + (p.salePrice || 0), 0) : 0;
      totalProductRevenue += productTotal;
      totalServiceRevenue += (appt.price - productTotal);
  });

  const serviceCommission = totalServiceRevenue * (professional.commissionRate / 100);
  const productCommission = totalProductRevenue * ((professional.productCommissionRate || 0) / 100);
  const totalEarnings = serviceCommission + productCommission;

  const handleBlock = () => {
    if (blockMode === 'single' && blockDate) {
        addBlockedPeriod(salon.id, {
            id: Math.random().toString(),
            date: blockDate,
            professionalId: professional.id,
            reason: 'Bloqueio Manual'
        });
        setBlockDate('');
        alert('Data bloqueada com sucesso!');
    } else if (blockMode === 'range' && blockRange.start && blockRange.end) {
        const start = new Date(blockRange.start);
        const end = new Date(blockRange.end);
        
        // Loop through dates
        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            addBlockedPeriod(salon.id, {
                id: Math.random().toString(),
                date: dateStr,
                professionalId: professional.id,
                reason: 'Bloqueio de Período'
            });
        }
        setBlockRange({ start: '', end: '' });
        alert('Período bloqueado com sucesso!');
    }
  };

  const handleManualBooking = () => {
      if (!newAppt.clientName || !newAppt.serviceId || !newAppt.date || !newAppt.time) return;
      
      const service = salon.services.find(s => s.id === newAppt.serviceId);
      if (!service) return;

      const finalDate = new Date(`${newAppt.date}T${newAppt.time}:00`).toISOString();

      addAppointment(salon.id, {
          id: Math.random().toString(36).substr(2, 9),
          salonId: salon.id,
          serviceId: newAppt.serviceId,
          professionalId: professional.id, // Auto-assigned to self
          clientName: newAppt.clientName,
          clientPhone: newAppt.clientPhone || '00000000',
          date: finalDate,
          status: 'scheduled',
          price: service.price
      });

      setIsBookingModalOpen(false);
      setNewAppt({ clientName: '', clientPhone: '', serviceId: '', date: '', time: '' });
      alert('Agendamento realizado!');
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'agenda':
              return (
                  <div className="space-y-4">
                      {/* Header Actions */}
                      <div className="grid grid-cols-2 gap-3">
                          <Button className="flex items-center justify-center gap-1 text-xs h-12" onClick={() => setIsBookingModalOpen(true)}>
                              <Plus className="w-4 h-4" /> Novo Agendamento
                          </Button>
                          <div className="bg-blue-50 px-3 py-2 rounded-xl flex items-center justify-between border border-blue-100">
                               <div className="text-xs text-blue-800 font-bold">Hoje</div>
                               <Badge color="blue">{myAppointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}</Badge>
                          </div>
                      </div>

                      <div className="space-y-3">
                          <h3 className="font-bold text-gray-700 text-sm px-1">Seus Agendamentos</h3>
                          {myAppointments.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">Agenda vazia.</p>}
                          {myAppointments.map(app => (
                              <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                  <div>
                                      <div className="font-bold text-gray-800 flex items-center gap-2">
                                          {new Date(app.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                          <span className="text-xs font-normal text-gray-500">{new Date(app.date).toLocaleDateString()}</span>
                                      </div>
                                      <div className="text-sm text-gray-600 font-medium">{app.clientName}</div>
                                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                        {salon.services.find(s => s.id === app.serviceId)?.name}
                                        {app.products && app.products.length > 0 && (
                                            <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-bold">
                                                <ShoppingBag className="w-3 h-3" /> +{app.products.length}
                                            </span>
                                        )}
                                      </div>
                                  </div>
                                  <Badge color={app.status === 'completed' ? 'green' : 'blue'}>
                                      {app.status === 'scheduled' ? 'Agendado' : 'Concluído'}
                                  </Badge>
                              </div>
                          ))}
                      </div>

                      <Card title="Gerenciar Disponibilidade" className="mt-8 border-orange-100 bg-orange-50/50">
                          <div className="space-y-3">
                              <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                                  <button 
                                      className={`flex-1 py-1.5 text-xs font-bold rounded ${blockMode === 'single' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                                      onClick={() => setBlockMode('single')}
                                  >
                                      Dia Único
                                  </button>
                                  <button 
                                      className={`flex-1 py-1.5 text-xs font-bold rounded ${blockMode === 'range' ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}
                                      onClick={() => setBlockMode('range')}
                                  >
                                      Período (Férias)
                                  </button>
                              </div>

                              {blockMode === 'single' ? (
                                  <div className="flex gap-2">
                                      <Input type="date" className="mb-0 bg-white" value={blockDate} onChange={e => setBlockDate(e.target.value)} />
                                      <Button variant="danger" onClick={handleBlock} disabled={!blockDate}>
                                          <Ban className="w-4 h-4" />
                                      </Button>
                                  </div>
                              ) : (
                                  <div className="space-y-2">
                                      <div className="grid grid-cols-2 gap-2">
                                          <div>
                                              <label className="text-[10px] uppercase font-bold text-gray-500">De</label>
                                              <Input type="date" className="mb-0 bg-white" value={blockRange.start} onChange={e => setBlockRange({...blockRange, start: e.target.value})} />
                                          </div>
                                          <div>
                                              <label className="text-[10px] uppercase font-bold text-gray-500">Até</label>
                                              <Input type="date" className="mb-0 bg-white" value={blockRange.end} onChange={e => setBlockRange({...blockRange, end: e.target.value})} />
                                          </div>
                                      </div>
                                      <Button variant="danger" className="w-full text-xs" onClick={handleBlock} disabled={!blockRange.start || !blockRange.end}>
                                          <CalendarRange className="w-3 h-3 mr-2" /> Bloquear Período
                                      </Button>
                                  </div>
                              )}
                          </div>
                      </Card>
                  </div>
              );
          case 'performance':
              return (
                  <div className="space-y-4">
                       <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                           <div className="text-sm opacity-80 mb-1">Total a Receber (Mês)</div>
                           <div className="text-3xl font-bold">R$ {totalEarnings.toFixed(2)}</div>
                       </Card>

                       <div className="grid grid-cols-2 gap-3">
                           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                               <div className="text-xs text-gray-500 uppercase mb-1">Serviços</div>
                               <div className="text-xl font-bold text-gray-800">R$ {serviceCommission.toFixed(2)}</div>
                               <div className="text-[10px] text-green-600 font-medium">({professional.commissionRate}%)</div>
                           </div>
                           <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                               <div className="text-xs text-gray-500 uppercase mb-1">Vendas</div>
                               <div className="text-xl font-bold text-gray-800">R$ {productCommission.toFixed(2)}</div>
                               <div className="text-[10px] text-green-600 font-medium">({professional.productCommissionRate || 0}%)</div>
                           </div>
                       </div>
                       
                       <h3 className="font-bold text-gray-700 px-1 mt-2">Histórico Detalhado</h3>
                       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                           {completedAppts.map(app => {
                               const prodTotal = app.products?.reduce((s, p) => s + (p.salePrice || 0), 0) || 0;
                               const svcPrice = app.price - prodTotal;
                               
                               const earnSvc = svcPrice * (professional.commissionRate / 100);
                               const earnProd = prodTotal * ((professional.productCommissionRate || 0) / 100);

                               return (
                               <div key={app.id} className="p-3 border-b border-gray-100 flex justify-between items-center">
                                   <div>
                                       <div className="text-sm font-medium">{new Date(app.date).toLocaleDateString()}</div>
                                       <div className="text-xs text-gray-500">
                                            {salon.services.find(s => s.id === app.serviceId)?.name}
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-xs text-gray-400">Total: R$ {app.price.toFixed(2)}</div>
                                       <div className="text-sm font-bold text-green-600">
                                           + R$ {(earnSvc + earnProd).toFixed(2)}
                                       </div>
                                   </div>
                               </div>
                               )
                           })}
                           {completedAppts.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">Nenhum serviço concluído este mês.</div>}
                       </div>
                  </div>
              );
      }
  };

  const Header = (
      <div className="px-4 py-3 bg-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
              <img src={professional.avatarUrl} className="w-10 h-10 rounded-full border border-gray-200" />
              <div>
                  <div className="font-bold text-gray-900 leading-tight">{professional.name}</div>
                  <div className="text-xs text-gray-500">Painel do Profissional</div>
              </div>
          </div>
          <button onClick={onLogout} className="text-gray-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
          </button>
      </div>
  );

  return (
    <AppShell
        header={Header}
        bottomNav={
            <MobileNav>
                <MobileNavItem icon={<Calendar />} label="Minha Agenda" active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} />
                <MobileNavItem icon={<DollarSign />} label="Comissões" active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
            </MobileNav>
        }
    >
        <div className="p-4">
            {renderContent()}

            {/* Modal de Agendamento Manual */}
            <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Novo Agendamento">
                <div className="space-y-4">
                    <Input 
                        label="Nome do Cliente"
                        placeholder="Ex: Cliente Balcão"
                        value={newAppt.clientName}
                        onChange={e => setNewAppt({...newAppt, clientName: e.target.value})}
                    />
                     <Input 
                        label="Telefone (Opcional)"
                        placeholder="Apenas números"
                        value={newAppt.clientPhone}
                        onChange={e => setNewAppt({...newAppt, clientPhone: e.target.value})}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
                        <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                            value={newAppt.serviceId}
                            onChange={e => setNewAppt({...newAppt, serviceId: e.target.value})}
                        >
                            <option value="">Selecione...</option>
                            {salon.services.map(s => (
                                <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input type="date" label="Data" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                        <Input type="time" label="Hora" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                    </div>
                    <Button className="w-full mt-2" onClick={handleManualBooking}>Confirmar</Button>
                </div>
            </Modal>
        </div>
    </AppShell>
  );
};
