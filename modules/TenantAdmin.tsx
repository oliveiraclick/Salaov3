
import React, { useState } from 'react';
import { useStore } from '../store';
import { Salon, Service, Professional, Transaction, TransactionType, PaymentMethod } from '../types';
import { Button, Card, Input, Badge, ImageUpload, AppShell, MobileNav, MobileNavItem, Modal } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Calendar, Users, Scissors, DollarSign, Settings, 
  Sparkles, Lock, LogOut, Save, Plus, X, Check, Clock, CreditCard, Ticket,
  TrendingUp, TrendingDown, Wallet, Edit, Banknote, QrCode
} from 'lucide-react';
import { generateSalonDescription } from '../services/geminiService';

export const TenantAdmin: React.FC<{ salonId: string; onBack: () => void }> = ({ salonId, onBack }) => {
  const { salons, updateSalon, addAppointment, addBlockedPeriod, addTransaction } = useStore();
  const salon = salons.find(s => s.id === salonId);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'services' | 'team' | 'finance' | 'settings'>('dashboard');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // States for Forms
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({ name: '', duration: '30', price: '' });

  const [isAddingPro, setIsAddingPro] = useState(false);
  const [editingProId, setEditingProId] = useState<string | null>(null); // New state for editing
  const [newPro, setNewPro] = useState({ name: '', commission: '', avatar: '' });

  const [isAddingAppt, setIsAddingAppt] = useState(false);
  const [newAppt, setNewAppt] = useState({ clientName: '', serviceId: '', professionalId: '', date: '', time: '' });

  // Finance Form
  const [newTrans, setNewTrans] = useState<{
      description: string; amount: string; type: TransactionType; category: string; method: PaymentMethod; date: string; installments: string;
  }>({ description: '', amount: '', type: 'expense', category: 'Despesas Gerais', method: 'cash', date: new Date().toISOString().split('T')[0], installments: '1' });
  const [isAddingTrans, setIsAddingTrans] = useState(false);

  // Block periods
  const [blockType, setBlockType] = useState<'salon' | 'professional'>('salon');
  const [blockDate, setBlockDate] = useState('');
  const [blockProId, setBlockProId] = useState('');

  // QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrPro, setSelectedQrPro] = useState<Professional | null>(null);

  if (!salon) return <div>Salão não encontrado</div>;

  const isPro = salon.plan === 'professional' || salon.plan === 'redes';
  const totalSales = salon.appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => acc + curr.price, 0);

  const topServicesData = salon.services.map(s => ({
    name: s.name,
    count: salon.appointments.filter(a => a.serviceId === s.id).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const triggerSaveFeedback = () => {
    setSaveStatus('Salvando...');
    setTimeout(() => setSaveStatus('Salvo!'), 500);
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleAiDescription = async () => {
    setIsGeneratingAi(true);
    const desc = await generateSalonDescription(salon.name, salon.services.map(s => s.name));
    updateSalon({ ...salon, description: desc });
    setIsGeneratingAi(false);
    triggerSaveFeedback();
  };

  const updateSettings = (key: keyof Salon, value: any) => {
    updateSalon({ ...salon, [key]: value });
  };
  
  const updateSocials = (key: string, value: string) => {
      updateSalon({ ...salon, socials: { ...salon.socials, [key]: value } });
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
    triggerSaveFeedback();
  };

  const handleSavePro = () => {
    if (!newPro.name) return;
    
    if (editingProId) {
        // Update existing
        const updatedPros = salon.professionals.map(p => {
            if (p.id === editingProId) {
                return {
                    ...p,
                    name: newPro.name,
                    avatarUrl: newPro.avatar || p.avatarUrl,
                    commissionRate: parseFloat(newPro.commission) || 0
                };
            }
            return p;
        });
        updateSalon({ ...salon, professionals: updatedPros });
    } else {
        // Create new
        const pro: Professional = {
            id: Math.random().toString(36).substr(2, 9),
            name: newPro.name,
            avatarUrl: newPro.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newPro.name)}&background=random`,
            commissionRate: parseFloat(newPro.commission) || 0,
            password: '123'
        };
        updateSalon({ ...salon, professionals: [...salon.professionals, pro] });
    }

    setIsAddingPro(false);
    setEditingProId(null);
    setNewPro({ name: '', commission: '', avatar: '' });
    triggerSaveFeedback();
  };

  const handleEditPro = (pro: Professional) => {
      setEditingProId(pro.id);
      setNewPro({
          name: pro.name,
          commission: pro.commissionRate.toString(),
          avatar: pro.avatarUrl
      });
      setIsAddingPro(true);
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
    triggerSaveFeedback();
  };

  const handleAddTransaction = () => {
      if(!newTrans.description || !newTrans.amount) return;
      
      const installments = newTrans.method === 'credit_split' ? parseInt(newTrans.installments) : 1;
      
      const transaction: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          description: newTrans.description + (installments > 1 ? ` (1/${installments})` : ''),
          amount: parseFloat(newTrans.amount) / (installments > 1 ? installments : 1), // Split amount if installments
          type: newTrans.type,
          category: newTrans.category,
          date: newTrans.date,
          paymentMethod: newTrans.method,
          installments: installments > 1 ? { current: 1, total: installments } : undefined
      };

      addTransaction(salon.id, transaction);
      setIsAddingTrans(false);
      setNewTrans({ description: '', amount: '', type: 'expense', category: 'Despesas Gerais', method: 'cash', date: new Date().toISOString().split('T')[0], installments: '1' });
      triggerSaveFeedback();
  };

  // Helper to pre-fill payout
  const handlePayCommission = (proName: string, amount: number) => {
      setNewTrans({
          description: `Pagamento Comissão - ${proName}`,
          amount: amount.toFixed(2),
          type: 'expense',
          category: 'Comissões',
          method: 'pix',
          date: new Date().toISOString().split('T')[0],
          installments: '1'
      });
      setIsAddingTrans(true);
      window.scrollTo(0,0);
  };

  const handleAddBlock = () => {
      if(!blockDate) return;
      addBlockedPeriod(salon.id, {
          id: Math.random().toString(36).substr(2,9),
          date: blockDate,
          professionalId: blockType === 'professional' ? blockProId : undefined,
          reason: 'Bloqueio Manual / Folga'
      });
      setBlockDate('');
      triggerSaveFeedback();
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            {!isPro && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-700">
                    <b>Plano Start</b><br/>
                    Limites: {salon.appointments.length}/50 agendamentos.
                    </p>
                </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
               <Card className="p-4">
                  <div className="text-xs text-gray-500 uppercase">Agendamentos</div>
                  <div className="text-2xl font-bold text-gray-800">{salon.appointments.length}</div>
               </Card>
               {isPro ? (
                 <Card className="p-4">
                    <div className="text-xs text-gray-500 uppercase">Faturamento</div>
                    <div className="text-2xl font-bold text-green-600">R$ {totalSales.toFixed(0)}</div>
                 </Card>
               ) : (
                 <Card className="p-4 opacity-50 relative">
                     <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-400" />
                     <div className="text-xs text-gray-500 uppercase">Faturamento</div>
                     <div className="text-2xl font-bold text-gray-400">---</div>
                 </Card>
               )}
            </div>

            {isPro ? (
                <Card title="Top Serviços">
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topServicesData}>
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            ) : null}
          </div>
        );

      case 'finance':
        if (!isPro) return <div className="p-4 text-center text-gray-500">Recurso disponível apenas no plano Profissional.</div>;
        
        const totalIncome = salon.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = salon.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = totalIncome - totalExpense;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                        <div className="text-[10px] uppercase text-green-600 font-bold">Receitas</div>
                        <div className="text-lg font-bold text-green-700">R$ {totalIncome.toFixed(0)}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                         <div className="text-[10px] uppercase text-red-600 font-bold">Despesas</div>
                         <div className="text-lg font-bold text-red-700">R$ {totalExpense.toFixed(0)}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                         <div className="text-[10px] uppercase text-gray-500 font-bold">Saldo</div>
                         <div className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {balance.toFixed(0)}</div>
                    </div>
                </div>

                <Button className="w-full flex items-center justify-center gap-2" onClick={() => setIsAddingTrans(true)}>
                    <Plus className="w-4 h-4" /> Novo Lançamento
                </Button>

                {isAddingTrans && (
                    <Card className="bg-gray-50 border-gray-200 animate-in slide-in-from-top-4">
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <button className={`flex-1 py-2 rounded-md font-bold text-sm ${newTrans.type === 'expense' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-white text-gray-600'}`} onClick={() => setNewTrans({...newTrans, type: 'expense'})}>Despesa</button>
                                <button className={`flex-1 py-2 rounded-md font-bold text-sm ${newTrans.type === 'income' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-white text-gray-600'}`} onClick={() => setNewTrans({...newTrans, type: 'income'})}>Receita</button>
                            </div>
                            <Input placeholder="Descrição (ex: Luz, Água)" value={newTrans.description} onChange={e => setNewTrans({...newTrans, description: e.target.value})} />
                            <div className="grid grid-cols-2 gap-2">
                                <Input type="number" placeholder="Valor R$" value={newTrans.amount} onChange={e => setNewTrans({...newTrans, amount: e.target.value})} />
                                <Input type="date" value={newTrans.date} onChange={e => setNewTrans({...newTrans, date: e.target.value})} />
                            </div>
                            <select className="w-full px-3 py-2 border rounded-md" value={newTrans.method} onChange={e => setNewTrans({...newTrans, method: e.target.value as PaymentMethod})}>
                                <option value="cash">Dinheiro</option>
                                <option value="pix">Pix</option>
                                <option value="debit_card">Cartão de Débito</option>
                                <option value="credit_card">Cartão de Crédito (1x)</option>
                                <option value="credit_split">Cartão de Crédito (Parcelado)</option>
                            </select>
                            
                            {newTrans.method === 'credit_split' && (
                                <Input label="Número de Parcelas" type="number" min="2" max="12" value={newTrans.installments} onChange={e => setNewTrans({...newTrans, installments: e.target.value})} />
                            )}

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1" onClick={() => setIsAddingTrans(false)}>Cancelar</Button>
                                <Button className="flex-1" onClick={handleAddTransaction}>Salvar</Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Relatório de Comissões */}
                <Card className="border border-brand-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Banknote className="w-5 h-5 text-brand-600" />
                        <h3 className="font-bold text-gray-800">Previsão de Comissões (Mês Atual)</h3>
                    </div>
                    <div className="space-y-3">
                        {salon.professionals.map(pro => {
                            // Calculate commission for current month based on completed appointments
                            const currentMonth = new Date().getMonth();
                            const proAppts = salon.appointments.filter(a => 
                                a.professionalId === pro.id && 
                                a.status === 'completed' &&
                                new Date(a.date).getMonth() === currentMonth
                            );
                            const totalGenerated = proAppts.reduce((acc, curr) => acc + curr.price, 0);
                            const commissionAmount = (totalGenerated * pro.commissionRate) / 100;

                            return (
                                <div key={pro.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{pro.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {proAppts.length} serviços • Gerou R$ {totalGenerated.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <div className="font-bold text-brand-600 text-sm">
                                            A Pagar: R$ {commissionAmount.toFixed(2)}
                                        </div>
                                        {commissionAmount > 0 && (
                                            <button 
                                                onClick={() => handlePayCommission(pro.name, commissionAmount)}
                                                className="text-[10px] bg-white border border-gray-300 px-2 py-1 rounded hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                                            >
                                                Registrar Pagamento
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="space-y-2">
                    <h3 className="font-bold text-gray-700 text-sm">Últimos Lançamentos</h3>
                    {salon.transactions.slice().reverse().map(t => (
                        <div key={t.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-sm text-gray-800">{t.description}</div>
                                <div className="text-xs text-gray-500 flex gap-2">
                                    <span>{new Date(t.date).toLocaleDateString()}</span>
                                    <span>• {t.paymentMethod}</span>
                                    {t.installments && <span className="bg-blue-100 text-blue-800 px-1 rounded">Parcela {t.installments.current}/{t.installments.total}</span>}
                                </div>
                            </div>
                            <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {salon.transactions.length === 0 && <p className="text-gray-400 text-sm text-center">Nenhum lançamento.</p>}
                </div>
            </div>
        );

      case 'agenda':
        return (
           <div className="space-y-4">
             <Button className="w-full" onClick={() => setIsAddingAppt(!isAddingAppt)}>
                 {isAddingAppt ? 'Cancelar' : '+ Novo Agendamento'}
             </Button>

             {isAddingAppt && (
               <Card className="bg-brand-50 border-brand-200">
                 <div className="space-y-3">
                   <Input 
                      className="bg-white"
                      placeholder="Nome do Cliente" 
                      value={newAppt.clientName}
                      onChange={e => setNewAppt({...newAppt, clientName: e.target.value})}
                   />
                   <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      value={newAppt.serviceId}
                      onChange={e => setNewAppt({...newAppt, serviceId: e.target.value})}
                   >
                     <option value="">Selecione o Serviço</option>
                     {salon.services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
                   </select>
                   <div className="grid grid-cols-2 gap-2">
                    <Input type="date" className="bg-white" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                    <Input type="time" className="bg-white" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                   </div>
                   <Button className="w-full" onClick={handleSaveAppt}>Confirmar</Button>
                 </div>
               </Card>
             )}

             <div className="space-y-3">
                {salon.appointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">Agenda vazia.</p>
                ) : (
                salon.appointments.map(app => {
                    const serviceName = salon.services.find(s => s.id === app.serviceId)?.name;
                    const proName = salon.professionals.find(p => p.id === app.professionalId)?.name;
                    return (
                    <div key={app.id} className="flex flex-col p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-800 text-lg">
                                {new Date(app.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <Badge color={app.status === 'completed' ? 'green' : 'blue'}>
                                {app.status === 'scheduled' ? 'Agendado' : 'Concluído'}
                            </Badge>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">{serviceName} com {proName}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {app.clientName}
                            <span className="mx-1">•</span>
                            {new Date(app.date).toLocaleDateString()}
                        </div>
                    </div>
                    )
                })
                )}
             </div>

             <Card title="Bloqueios" className="mt-6">
                 <div className="space-y-3">
                     <div className="flex gap-2 text-xs">
                         <button className={`flex-1 py-2 rounded-md ${blockType === 'salon' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`} onClick={() => setBlockType('salon')}>Salão</button>
                         <button className={`flex-1 py-2 rounded-md ${blockType === 'professional' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`} onClick={() => setBlockType('professional')}>Profissional</button>
                     </div>
                     <Input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
                     {blockType === 'professional' && (
                         <select className="w-full px-3 py-2 border rounded-md bg-white text-sm" value={blockProId} onChange={(e) => setBlockProId(e.target.value)}>
                             <option value="">Selecione...</option>
                             {salon.professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                     )}
                     <Button variant="danger" className="w-full" onClick={handleAddBlock} disabled={!blockDate}>Bloquear</Button>
                 </div>
             </Card>
           </div>
        );
      
      case 'team':
        return (
            <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    {salon.professionals.map(pro => (
                        <div key={pro.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center relative group">
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button 
                                    onClick={() => { setSelectedQrPro(pro); setQrModalOpen(true); }}
                                    className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                                    title="QR Code"
                                >
                                    <QrCode className="w-3 h-3" />
                                </button>
                                <button 
                                    onClick={() => handleEditPro(pro)}
                                    className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                                    title="Editar"
                                >
                                    <Edit className="w-3 h-3" />
                                </button>
                            </div>
                            <img src={pro.avatarUrl} alt={pro.name} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                            <h3 className="font-bold text-gray-900 text-sm truncate">{pro.name}</h3>
                            <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 mt-1">
                                <DollarSign className="w-3 h-3" />
                                {pro.commissionRate}%
                            </div>
                        </div>
                    ))}
                    
                    <button 
                    onClick={() => {
                        setEditingProId(null);
                        setNewPro({ name: '', commission: '', avatar: '' });
                        setIsAddingPro(true);
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center h-40 bg-gray-50 hover:bg-white"
                    >
                        <Plus className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Adicionar</span>
                    </button>
                 </div>

                 {isAddingPro && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-sm">
                            <h3 className="font-bold mb-4">{editingProId ? 'Editar Profissional' : 'Novo Profissional'}</h3>
                            <div className="space-y-3">
                                <ImageUpload className="w-20 h-20 mx-auto rounded-full" currentImage={newPro.avatar} onImageUpload={(base64) => setNewPro({...newPro, avatar: base64})} />
                                <Input placeholder="Nome" value={newPro.name} onChange={e => setNewPro({...newPro, name: e.target.value})} />
                                <Input label="Comissão (%)" placeholder="Ex: 50" type="number" value={newPro.commission} onChange={e => setNewPro({...newPro, commission: e.target.value})} />
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => { setIsAddingPro(false); setEditingProId(null); }}>Cancelar</Button>
                                    <Button className="flex-1" onClick={handleSavePro}>Salvar</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                 )}

                 {/* QR Code Modal */}
                 <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title={`QR Code: ${selectedQrPro?.name}`}>
                     <div className="flex flex-col items-center justify-center p-4 text-center">
                         <div className="bg-white p-4 rounded-xl border-2 border-brand-100 mb-4">
                             <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://salaoonline.com.br/${salon.slug}?pro=${selectedQrPro?.id}`} 
                                alt="QR Code"
                                className="w-48 h-48"
                             />
                         </div>
                         <p className="text-sm text-gray-600 mb-4">
                             Escaneie para agendar direto com <b>{selectedQrPro?.name}</b>.
                         </p>
                         <div className="w-full bg-gray-50 p-2 rounded border border-gray-200 text-xs text-gray-500 break-all">
                             https://app.salaoonline.com.br/public/{salon.id}?pro={selectedQrPro?.id}
                         </div>
                         <Button className="w-full mt-4" onClick={() => setQrModalOpen(false)}>Fechar</Button>
                     </div>
                 </Modal>
            </div>
        )

       case 'services':
        return (
            <div className="space-y-4">
                 <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                    {salon.services.map(svc => (
                        <div key={svc.id} className="p-4 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">{svc.name}</h4>
                                <p className="text-xs text-gray-500">{svc.durationMinutes} min</p>
                            </div>
                            <span className="font-bold text-brand-600 text-sm">R$ {svc.price.toFixed(2)}</span>
                        </div>
                    ))}
                 </div>
                 
                 <Button className="w-full py-3" onClick={() => setIsAddingService(true)}>+ Adicionar Serviço</Button>

                 {isAddingService && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
                        <Card className="w-full max-w-sm rounded-b-none sm:rounded-xl animate-in slide-in-from-bottom-full duration-300">
                             <h3 className="font-bold mb-4">Novo Serviço</h3>
                             <div className="space-y-3">
                                 <Input label="Nome" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                                 <div className="grid grid-cols-2 gap-3">
                                     <Input label="Minutos" type="number" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} />
                                     <Input label="Preço" type="number" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                                 </div>
                                 <div className="flex gap-2 mt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => setIsAddingService(false)}>Cancelar</Button>
                                    <Button className="flex-1" onClick={handleSaveService}>Salvar</Button>
                                </div>
                             </div>
                        </Card>
                    </div>
                 )}
            </div>
        )

      case 'settings':
        return (
          <div className="space-y-6 pb-8">
            <Card title="Identidade">
                 <div className="space-y-4">
                     <ImageUpload 
                        className="w-full h-32 object-cover rounded-lg"
                        currentImage={salon.coverImage}
                        placeholder="Alterar capa"
                        onImageUpload={(base64) => updateSettings('coverImage', base64)}
                     />
                     <Input label="Nome" value={salon.name} onChange={(e) => updateSettings('name', e.target.value)} />
                     <select 
                        className="w-full px-3 py-2 border rounded-md bg-white text-sm"
                        value={salon.category || 'Salão'}
                        onChange={(e) => updateSettings('category', e.target.value)}
                     >
                         <option value="Salão">Salão de Beleza</option>
                         <option value="Barbearia">Barbearia</option>
                         <option value="Manicure">Esmalteria</option>
                         <option value="Spa">Spa</option>
                     </select>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Sobre Nós (Descrição da Página)</label>
                         <textarea 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                            rows={4}
                            value={salon.aboutUs || ''}
                            onChange={(e) => updateSettings('aboutUs', e.target.value)}
                         />
                         <button className="text-xs text-brand-600 mt-1 flex items-center gap-1" onClick={handleAiDescription} disabled={isGeneratingAi}>
                            <Sparkles className="w-3 h-3" /> {isGeneratingAi ? 'Gerando...' : 'Gerar com IA'}
                         </button>
                     </div>
                 </div>
            </Card>

            <Card title="Redes Sociais">
                <div className="space-y-3">
                    <Input label="Instagram" placeholder="@usuario" value={salon.socials?.instagram || ''} onChange={(e) => updateSocials('instagram', e.target.value)} />
                    <Input label="Facebook" placeholder="Link da página" value={salon.socials?.facebook || ''} onChange={(e) => updateSocials('facebook', e.target.value)} />
                    <Input label="WhatsApp" placeholder="Apenas números (Ex: 11999999999)" value={salon.socials?.whatsapp || ''} onChange={(e) => updateSocials('whatsapp', e.target.value)} />
                    <Input label="Website" placeholder="https://..." value={salon.socials?.website || ''} onChange={(e) => updateSocials('website', e.target.value)} />
                </div>
            </Card>

            <Card title="Assinatura">
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                            <div className="text-xs text-gray-500 uppercase">Plano Atual</div>
                            <div className="font-bold text-brand-600 uppercase">{salon.plan}</div>
                        </div>
                        <div className="text-right">
                             <div className="text-xs text-gray-500 uppercase">Valor</div>
                             <div className="font-bold">R$ {salon.monthlyFee?.toFixed(2)}</div>
                        </div>
                    </div>
                    {salon.appliedCoupon && (
                        <Badge color="green" className="w-full justify-center">Cupom {salon.appliedCoupon} Aplicado na adesão</Badge>
                    )}
                </div>
            </Card>

            <Card title="Horários">
                <div className="space-y-4">
                    <div>
                         <label className="text-xs font-bold text-gray-500 uppercase">Intervalo (Slots)</label>
                         <div className="flex gap-2 mt-2">
                             {[30, 45, 60].map(min => (
                                 <button
                                    key={min}
                                    onClick={() => updateSettings('slotInterval', min)}
                                    className={`flex-1 py-2 rounded text-sm ${salon.slotInterval === min ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                 >
                                     {min}m
                                 </button>
                             ))}
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Abre" type="time" value={salon.openTime || '09:00'} onChange={(e) => updateSettings('openTime', e.target.value)} />
                        <Input label="Fecha" type="time" value={salon.closeTime || '18:00'} onChange={(e) => updateSettings('closeTime', e.target.value)} />
                    </div>
                </div>
            </Card>

            <div className="p-4">
                <Button variant="danger" className="w-full flex justify-center items-center gap-2" onClick={onBack}>
                    <LogOut className="w-4 h-4" /> Sair do App
                </Button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const Header = (
    <div className="px-4 py-3 flex items-center gap-3 bg-white">
        <div className="w-10 h-10 bg-brand-100 rounded-full overflow-hidden flex-shrink-0">
             {salon.coverImage ? (
                 <img src={salon.coverImage} className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-600 font-bold">{salon.name[0]}</div>
             )}
        </div>
        <div>
            <h1 className="font-bold text-gray-900 leading-tight">{salon.name}</h1>
            <p className="text-xs text-gray-500 uppercase font-semibold">{activeTab}</p>
        </div>
        <div className="ml-auto">
             {saveStatus && <span className="text-xs font-bold text-green-600 animate-pulse">{saveStatus}</span>}
        </div>
    </div>
  );

  return (
    <AppShell 
        header={Header}
        bottomNav={
            <MobileNav>
                <MobileNavItem icon={<LayoutDashboard />} label="Início" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <MobileNavItem icon={<Calendar />} label="Agenda" active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} />
                <MobileNavItem icon={<Wallet />} label="Financeiro" active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} />
                <MobileNavItem icon={<Users />} label="Equipe" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                <MobileNavItem icon={<Settings />} label="Config" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </MobileNav>
        }
    >
        <div className="p-4">
            {renderContent()}
        </div>
    </AppShell>
  );
};
