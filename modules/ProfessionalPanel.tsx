
import React, { useState } from 'react';
import { useStore } from '../store';
import { AppShell, MobileNav, MobileNavItem, Card, Badge, Button, Input } from '../components/UI';
import { Calendar, User, DollarSign, LogOut, Clock, Ban } from 'lucide-react';
import { Professional, Appointment } from '../types';

export const ProfessionalPanel: React.FC<{ 
  salonId: string; 
  professionalId: string;
  onLogout: () => void; 
}> = ({ salonId, professionalId, onLogout }) => {
  const { salons, addBlockedPeriod } = useStore();
  const salon = salons.find(s => s.id === salonId);
  const professional = salon?.professionals.find(p => p.id === professionalId);

  const [activeTab, setActiveTab] = useState<'agenda' | 'performance'>('agenda');
  const [blockDate, setBlockDate] = useState('');

  if (!salon || !professional) return <div>Acesso negado.</div>;

  const myAppointments = salon.appointments.filter(a => a.professionalId === professionalId);
  
  // Calculate Commission
  const currentMonth = new Date().getMonth();
  const completedAppts = myAppointments.filter(a => a.status === 'completed' && new Date(a.date).getMonth() === currentMonth);
  const totalGenerated = completedAppts.reduce((acc, curr) => acc + curr.price, 0);
  const myCommission = (totalGenerated * professional.commissionRate) / 100;

  const handleBlock = () => {
    if(blockDate) {
        addBlockedPeriod(salon.id, {
            id: Math.random().toString(),
            date: blockDate,
            professionalId: professional.id,
            reason: 'Bloqueio pelo Profissional'
        });
        setBlockDate('');
        alert('Data bloqueada!');
    }
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'agenda':
              return (
                  <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <div>
                              <div className="font-bold text-blue-900">Próximos Clientes</div>
                              <div className="text-xs text-blue-600">Você tem {myAppointments.filter(a => a.status === 'scheduled').length} agendamentos.</div>
                          </div>
                      </div>

                      <div className="space-y-3">
                          {myAppointments.length === 0 && <p className="text-center text-gray-400 py-4">Agenda vazia.</p>}
                          {myAppointments.map(app => (
                              <div key={app.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                                  <div>
                                      <div className="font-bold text-gray-800">{new Date(app.date).toLocaleDateString()} às {new Date(app.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                      <div className="text-sm text-gray-600">{app.clientName}</div>
                                      <div className="text-xs text-gray-400">{salon.services.find(s => s.id === app.serviceId)?.name}</div>
                                  </div>
                                  <Badge color={app.status === 'completed' ? 'green' : 'blue'}>
                                      {app.status === 'scheduled' ? 'Agendado' : 'Concluído'}
                                  </Badge>
                              </div>
                          ))}
                      </div>

                      <Card title="Bloquear Agenda" className="mt-6">
                          <p className="text-xs text-gray-500 mb-2">Vai tirar folga? Bloqueie sua agenda.</p>
                          <div className="flex gap-2">
                              <Input type="date" className="mb-0" value={blockDate} onChange={e => setBlockDate(e.target.value)} />
                              <Button variant="danger" onClick={handleBlock} disabled={!blockDate}>
                                  <Ban className="w-4 h-4" />
                              </Button>
                          </div>
                      </Card>
                  </div>
              );
          case 'performance':
              return (
                  <div className="space-y-4">
                       <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                           <div className="text-sm opacity-80 mb-1">Minha Comissão (Mês Atual)</div>
                           <div className="text-3xl font-bold">R$ {myCommission.toFixed(2)}</div>
                           <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded">
                               {professional.commissionRate}% de R$ {totalGenerated.toFixed(2)}
                           </div>
                       </Card>
                       
                       <h3 className="font-bold text-gray-700 px-1">Histórico de Serviços</h3>
                       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                           {completedAppts.map(app => (
                               <div key={app.id} className="p-3 border-b border-gray-100 flex justify-between items-center">
                                   <div>
                                       <div className="text-sm font-medium">{new Date(app.date).toLocaleDateString()}</div>
                                       <div className="text-xs text-gray-500">{salon.services.find(s => s.id === app.serviceId)?.name}</div>
                                   </div>
                                   <div className="text-right">
                                       <div className="text-xs text-gray-400">Venda: R$ {app.price}</div>
                                       <div className="text-sm font-bold text-green-600">+ R$ {(app.price * professional.commissionRate / 100).toFixed(2)}</div>
                                   </div>
                               </div>
                           ))}
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
                  <div className="text-xs text-gray-500">Profissional</div>
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
        <div className="p-4">{renderContent()}</div>
    </AppShell>
  );
};
