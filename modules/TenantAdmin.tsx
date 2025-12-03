import React, { useState } from 'react';
import { useStore } from '../store';
import { Salon, Service, Professional } from '../types';
import { Button, Card, Input, Badge } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Calendar, Users, Scissors, DollarSign, Settings, 
  Sparkles, Lock, ArrowLeft, Save, Plus, X, Check
} from 'lucide-react';
import { generateSalonDescription } from '../services/geminiService';

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  disabled?: boolean;
  onClick: () => void 
}> = ({ icon, label, active, disabled, onClick }) => (
  <div 
    onClick={() => !disabled && onClick()}
    className={`
      flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all mb-1
      ${active ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}
      ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}
    `}
  >
    {icon}
    <span>{label}</span>
    {disabled && <Lock className="w-3 h-3 ml-auto text-gray-400" />}
  </div>
);

export const TenantAdmin: React.FC<{ salonId: string; onBack: () => void }> = ({ salonId, onBack }) => {
  const { salons, updateSalon, addAppointment } = useStore();
  const salon = salons.find(s => s.id === salonId);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'services' | 'team' | 'settings'>('dashboard');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // States for Forms
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({ name: '', duration: '30', price: '' });

  const [isAddingPro, setIsAddingPro] = useState(false);
  const [newPro, setNewPro] = useState({ name: '', commission: '' });

  const [isAddingAppt, setIsAddingAppt] = useState(false);
  const [newAppt, setNewAppt] = useState({ clientName: '', serviceId: '', professionalId: '', date: '', time: '' });

  if (!salon) return <div>Salão não encontrado</div>;

  const isPro = salon.plan === 'professional';

  // Dashboard Calculations
  const totalSales = salon.appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => acc + curr.price, 0);

  const topServicesData = salon.services.map(s => ({
    name: s.name,
    count: salon.appointments.filter(a => a.serviceId === s.id).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const handleAiDescription = async () => {
    setIsGeneratingAi(true);
    const desc = await generateSalonDescription(salon.name, salon.services.map(s => s.name));
    updateSalon({ ...salon, description: desc });
    setIsGeneratingAi(false);
  };

  const updateSettings = (key: keyof Salon, value: any) => {
    updateSalon({ ...salon, [key]: value });
  };

  const handleSaveService = () => {
    if (!newService.name || !newService.price) return;
    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: newService.name,
      durationMinutes: parseInt(newService.duration),
      price: parseFloat(newService.price)
    };
    updateSalon({ ...salon, services: [...salon.services, service] });
    setIsAddingService(false);
    setNewService({ name: '', duration: '30', price: '' });
  };

  const handleSavePro = () => {
    if (!newPro.name) return;
    const pro: Professional = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPro.name,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newPro.name)}&background=random`,
      commissionRate: parseFloat(newPro.commission) || 0
    };
    updateSalon({ ...salon, professionals: [...salon.professionals, pro] });
    setIsAddingPro(false);
    setNewPro({ name: '', commission: '' });
  };

  const handleSaveAppt = () => {
    if (!newAppt.clientName || !newAppt.serviceId || !newAppt.date || !newAppt.time) return;
    
    const service = salon.services.find(s => s.id === newAppt.serviceId);
    if (!service) return;

    const finalDate = new Date(`${newAppt.date}T${newAppt.time}:00`).toISOString();
    
    addAppointment(salon.id, {
      id: Math.random().toString(36).substr(2, 9),
      salonId: salon.id,
      serviceId: newAppt.serviceId,
      professionalId: newAppt.professionalId || salon.professionals[0]?.id,
      clientName: newAppt.clientName,
      clientPhone: '',
      date: finalDate,
      status: 'scheduled',
      price: service.price
    });
    setIsAddingAppt(false);
    setNewAppt({ clientName: '', serviceId: '', professionalId: '', date: '', time: '' });
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
            {!isPro && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                        Você está no plano <b>Start</b>. O Dashboard Financeiro completo é exclusivo do plano Profissional.
                        <br/>Limites: {salon.appointments.length}/50 agendamentos este mês.
                        </p>
                    </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card>
                  <div className="text-sm text-gray-500">Agendamentos Totais</div>
                  <div className="text-3xl font-bold text-gray-800">{salon.appointments.length}</div>
               </Card>
               {isPro && (
                 <>
                    <Card>
                        <div className="text-sm text-gray-500">Faturamento (Mês)</div>
                        <div className="text-3xl font-bold text-green-600">R$ {totalSales.toFixed(2)}</div>
                    </Card>
                    <Card>
                        <div className="text-sm text-gray-500">Ticket Médio</div>
                        <div className="text-3xl font-bold text-blue-600">
                            R$ {salon.appointments.length > 0 ? (totalSales / salon.appointments.length).toFixed(2) : '0.00'}
                        </div>
                    </Card>
                 </>
               )}
            </div>

            {isPro ? (
                <Card title="Serviços Mais Populares">
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topServicesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            ) : (
                <Card className="opacity-75 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="text-center p-6">
                            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-gray-700">Recurso Bloqueado</h3>
                            <p className="text-gray-500">Faça upgrade para ver gráficos de desempenho.</p>
                        </div>
                    </div>
                    <div className="h-64 bg-gray-100 animate-pulse"></div>
                </Card>
            )}
          </div>
        );

      case 'agenda':
        return (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-800">Agenda</h2>
               <Button onClick={() => setIsAddingAppt(!isAddingAppt)}>
                 {isAddingAppt ? 'Cancelar' : 'Novo Agendamento'}
               </Button>
             </div>

             {isAddingAppt && (
               <Card className="bg-brand-50 border-brand-200 animate-in fade-in slide-in-from-top-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <Input 
                      placeholder="Nome do Cliente" 
                      value={newAppt.clientName}
                      onChange={e => setNewAppt({...newAppt, clientName: e.target.value})}
                   />
                   <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 mb-4 bg-white"
                      value={newAppt.serviceId}
                      onChange={e => setNewAppt({...newAppt, serviceId: e.target.value})}
                   >
                     <option value="">Selecione o Serviço</option>
                     {salon.services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                   </select>
                   <Input 
                      type="date"
                      value={newAppt.date}
                      onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                   />
                   <Input 
                      type="time"
                      value={newAppt.time}
                      onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                   />
                   <div className="md:col-span-2 flex justify-end">
                      <Button onClick={handleSaveAppt}>Confirmar Agendamento</Button>
                   </div>
                 </div>
               </Card>
             )}

             <Card>
               <div className="space-y-4">
                 {salon.appointments.length === 0 ? (
                   <p className="text-gray-500 text-center py-8">Nenhum agendamento encontrado.</p>
                 ) : (
                   salon.appointments.map(app => {
                     const serviceName = salon.services.find(s => s.id === app.serviceId)?.name || 'Serviço Removido';
                     const proName = salon.professionals.find(p => p.id === app.professionalId)?.name || 'Profissional Removido';
                     return (
                       <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                         <div>
                            <div className="font-semibold text-gray-800">{new Date(app.date).toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{serviceName} com {proName}</div>
                            <div className="text-xs text-gray-500">Cliente: {app.clientName}</div>
                         </div>
                         <Badge color={app.status === 'completed' ? 'green' : 'blue'}>
                            {app.status === 'scheduled' ? 'Agendado' : 'Concluído'}
                         </Badge>
                       </div>
                     )
                   })
                 )}
               </div>
             </Card>
           </div>
        );
      
      case 'team':
        return (
            <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-gray-800">Profissionais</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {salon.professionals.map(pro => (
                        <Card key={pro.id} className="text-center relative group">
                            <img src={pro.avatarUrl} alt={pro.name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover" />
                            <h3 className="font-bold text-gray-900">{pro.name}</h3>
                            <p className="text-sm text-gray-500">Comissão: {pro.commissionRate}%</p>
                        </Card>
                    ))}
                    
                    {isAddingPro ? (
                       <Card className="border-2 border-brand-500 border-dashed bg-brand-50 flex flex-col justify-center gap-2">
                          <Input 
                             placeholder="Nome" 
                             className="bg-white mb-2"
                             value={newPro.name}
                             onChange={e => setNewPro({...newPro, name: e.target.value})}
                             autoFocus
                          />
                          <Input 
                             placeholder="% Comissão" 
                             type="number" 
                             className="bg-white mb-2"
                             value={newPro.commission}
                             onChange={e => setNewPro({...newPro, commission: e.target.value})}
                          />
                          <div className="flex gap-2 justify-end">
                             <Button variant="outline" className="p-2" onClick={() => setIsAddingPro(false)}>
                                <X className="w-4 h-4" />
                             </Button>
                             <Button className="p-2" onClick={handleSavePro}>
                                <Check className="w-4 h-4" />
                             </Button>
                          </div>
                       </Card>
                    ) : (
                      <button 
                        onClick={() => setIsAddingPro(true)}
                        className="border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center h-48 hover:border-brand-500 hover:text-brand-600 transition-colors bg-white hover:bg-brand-50"
                      >
                          <div className="text-center">
                              <Plus className="w-8 h-8 mx-auto mb-2" />
                              <span className="block font-medium">Adicionar Profissional</span>
                          </div>
                      </button>
                    )}
                 </div>
            </div>
        )

       case 'services':
        return (
            <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-gray-800">Serviços</h2>
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {salon.services.map(svc => (
                        <div key={svc.id} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <h4 className="font-bold text-gray-800">{svc.name}</h4>
                                <p className="text-sm text-gray-500">{svc.durationMinutes} min</p>
                            </div>
                            <span className="font-bold text-brand-600">R$ {svc.price.toFixed(2)}</span>
                        </div>
                    ))}
                    
                    {isAddingService ? (
                       <div className="p-4 bg-brand-50 border-t border-brand-100 flex gap-4 items-end animate-in slide-in-from-bottom-2">
                          <div className="flex-1">
                            <Input 
                              label="Nome" 
                              className="mb-0 bg-white" 
                              value={newService.name} 
                              onChange={e => setNewService({...newService, name: e.target.value})}
                            />
                          </div>
                          <div className="w-24">
                            <Input 
                              label="Minutos" 
                              type="number" 
                              className="mb-0 bg-white" 
                              value={newService.duration} 
                              onChange={e => setNewService({...newService, duration: e.target.value})}
                            />
                          </div>
                          <div className="w-32">
                            <Input 
                              label="Preço (R$)" 
                              type="number" 
                              className="mb-0 bg-white" 
                              value={newService.price} 
                              onChange={e => setNewService({...newService, price: e.target.value})}
                            />
                          </div>
                          <Button className="h-[42px] mb-[1px]" onClick={handleSaveService}>Salvar</Button>
                          <Button variant="outline" className="h-[42px] mb-[1px]" onClick={() => setIsAddingService(false)}>Cancelar</Button>
                       </div>
                    ) : (
                      <div 
                        onClick={() => setIsAddingService(true)}
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 text-center text-brand-600 font-medium transition-colors border-t border-gray-100"
                      >
                         + Novo Serviço
                      </div>
                    )}
                 </div>
            </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Configurações do Salão</h2>
            <Card title="Informações Básicas">
              <div className="space-y-4">
                <Input 
                  label="Nome do Salão" 
                  value={salon.name} 
                  onChange={(e) => updateSettings('name', e.target.value)} 
                />
                <Input 
                  label="Endereço" 
                  value={salon.address} 
                  onChange={(e) => updateSettings('address', e.target.value)} 
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição (Vitrine)</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
                    rows={4}
                    value={salon.description}
                    onChange={(e) => updateSettings('description', e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="secondary" 
                      onClick={handleAiDescription}
                      disabled={isGeneratingAi}
                      className="text-sm flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      {isGeneratingAi ? 'Gerando...' : 'Gerar com IA (Gemini)'}
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t flex justify-end">
                    <Button className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                    </Button>
                </div>
              </div>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
                 {salon.name.substring(0, 1)}
             </div>
             <div>
                <h1 className="font-bold text-gray-800 truncate w-32">{salon.name}</h1>
                <span className="text-xs text-gray-500 uppercase">{salon.plan}</span>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Calendar className="w-5 h-5" />} 
            label="Agenda" 
            active={activeTab === 'agenda'} 
            onClick={() => setActiveTab('agenda')} 
          />
          <SidebarItem 
            icon={<Users className="w-5 h-5" />} 
            label="Equipe" 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')} 
          />
          <SidebarItem 
            icon={<Scissors className="w-5 h-5" />} 
            label="Serviços" 
            active={activeTab === 'services'} 
            onClick={() => setActiveTab('services')} 
          />
           <div className="pt-4 mt-4 border-t border-gray-100">
             <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
               Financeiro
             </div>
             <SidebarItem 
                icon={<DollarSign className="w-5 h-5" />} 
                label="Controle de Vendas" 
                disabled={!isPro} 
                onClick={() => {}} 
             />
             <SidebarItem 
                icon={<DollarSign className="w-5 h-5" />} 
                label="Comissões" 
                disabled={!isPro} 
                onClick={() => {}} 
             />
           </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
           <SidebarItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Configurações" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
           />
           <button 
             onClick={onBack}
             className="w-full mt-2 flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm"
           >
             <ArrowLeft className="w-4 h-4" />
             Voltar para Super Admin
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
