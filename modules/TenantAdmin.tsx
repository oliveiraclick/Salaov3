
// ... existing imports ...
import React, { useState } from 'react';
import { useStore } from '../store';
import { Salon, Service, Professional, Transaction, TransactionType, PaymentMethod, Product } from '../types';
import { Button, Card, Input, Badge, ImageUpload, AppShell, MobileNav, MobileNavItem, Modal } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Calendar, Users, Scissors, DollarSign, Settings, 
  Sparkles, Lock, LogOut, Save, Plus, X, Check, Clock, CreditCard, Ticket,
  TrendingUp, TrendingDown, Wallet, Edit, Banknote, QrCode,
  Target, Package, Megaphone, Gift, AlertTriangle, MessageCircle, ShoppingBag, Trash2
} from 'lucide-react';
import { generateSalonDescription } from '../services/geminiService';

export const TenantAdmin: React.FC<{ salonId: string; onBack: () => void }> = ({ salonId, onBack }) => {
  // ... existing component logic ...
  const { salons, clients, updateSalon, addAppointment, addBlockedPeriod, addTransaction, addProduct, updateProduct } = useStore();
  const salon = salons.find(s => s.id === salonId);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'inventory' | 'team' | 'finance' | 'settings'>('dashboard');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // States for Forms
  const [isAddingService, setIsAddingService] = useState(false);
  const [newService, setNewService] = useState({ name: '', duration: '30', price: '' });

  const [isAddingPro, setIsAddingPro] = useState(false);
  const [editingProId, setEditingProId] = useState<string | null>(null); 
  const [newPro, setNewPro] = useState({ name: '', email: '', commission: '', productCommission: '', avatar: '' });

  const [isAddingAppt, setIsAddingAppt] = useState(false);
  const [newAppt, setNewAppt] = useState({ clientName: '', serviceId: '', professionalId: '', date: '', time: '' });

  // Inventory Form
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '', minQuantity: '', unit: 'un', isForSale: false, salePrice: '', costPrice: '', image: '' });

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

  // UNLOCK ALL FEATURES FOR EVERYONE
  const isPro = true; 
  
  const totalSales = salon.appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => acc + curr.price, 0);

  const totalIncome = salon.transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = salon.transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const topServicesData = salon.services.map(s => ({
    name: s.name,
    count: salon.appointments.filter(a => a.serviceId === s.id).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // ... rest of dashboard logic ...
  const revenueGoal = salon.revenueGoal || 5000;
  const progressPercent = Math.min((totalSales / revenueGoal) * 100, 100);

  const today = new Date();
  const birthdaysToday = clients.filter(c => {
      const hasHistory = salon.appointments.some(a => a.clientPhone === c.phone);
      if(!hasHistory) return false;

      const bDay = parseInt(c.birthDate.split('-')[2]);
      const bMonth = parseInt(c.birthDate.split('-')[1]);
      return bDay === today.getDate() && bMonth === (today.getMonth() + 1);
  });

  const lostClients = clients.filter(c => {
      const salonAppts = salon.appointments.filter(a => a.clientPhone === c.phone);
      if(salonAppts.length === 0) return false;
      
      const lastAppt = salonAppts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const diffTime = Math.abs(today.getTime() - new Date(lastAppt.date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays > 30;
  }).slice(0, 3); 

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

  const addGalleryImage = (base64: string) => {
      updateSalon({ ...salon, gallery: [...(salon.gallery || []), base64] });
      triggerSaveFeedback();
  };

  const removeGalleryImage = (index: number) => {
      const newGallery = [...(salon.gallery || [])];
      newGallery.splice(index, 1);
      updateSalon({ ...salon, gallery: newGallery });
      triggerSaveFeedback();
  };

  const handleSaveService = () => {
    // ... existing handleSaveService ...
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
    // ... existing handleSavePro ...
    if (!newPro.name || !newPro.email) {
        alert("Preencha nome e e-mail.");
        return;
    }
    
    const emailExists = salons.some(s => 
        s.id !== salon.id && 
        s.professionals.some(p => p.email === newPro.email) 
    );
    
    const emailExistsInCurrent = salon.professionals.some(p => p.email === newPro.email && p.id !== editingProId);

    if (emailExists || emailExistsInCurrent) {
        alert("Este e-mail já está em uso por outro profissional no sistema.");
        return;
    }
    
    if (editingProId) {
        const updatedPros = salon.professionals.map(p => {
            if (p.id === editingProId) {
                return {
                    ...p,
                    name: newPro.name,
                    email: newPro.email,
                    avatarUrl: newPro.avatar || p.avatarUrl,
                    commissionRate: parseFloat(newPro.commission) || 0,
                    productCommissionRate: parseFloat(newPro.productCommission) || 0
                };
            }
            return p;
        });
        updateSalon({ ...salon, professionals: updatedPros });
    } else {
        const pro: Professional = {
            id: Math.random().toString(36).substr(2, 9),
            name: newPro.name,
            email: newPro.email,
            avatarUrl: newPro.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newPro.name)}&background=random`,
            commissionRate: parseFloat(newPro.commission) || 0,
            productCommissionRate: parseFloat(newPro.productCommission) || 0,
            password: '123456' 
        };
        updateSalon({ ...salon, professionals: [...salon.professionals, pro] });
    }

    setIsAddingPro(false);
    setEditingProId(null);
    setNewPro({ name: '', email: '', commission: '', productCommission: '', avatar: '' });
    triggerSaveFeedback();
  };

  const handleEditPro = (pro: Professional) => {
      setEditingProId(pro.id);
      setNewPro({
          name: pro.name,
          email: pro.email || '',
          commission: pro.commissionRate.toString(),
          productCommission: (pro.productCommissionRate || 0).toString(),
          avatar: pro.avatarUrl
      });
      setIsAddingPro(true);
  };

  const handleSaveAppt = () => {
    // ... existing handleSaveAppt ...
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

  const handleSaveProduct = () => {
      // ... existing handleSaveProduct ...
      if(!newProduct.name || !newProduct.quantity) return;
      addProduct(salon.id, {
          id: Math.random().toString(36).substr(2,9),
          name: newProduct.name,
          quantity: parseInt(newProduct.quantity),
          minQuantity: parseInt(newProduct.minQuantity) || 5,
          unit: newProduct.unit,
          isForSale: newProduct.isForSale,
          salePrice: newProduct.isForSale ? parseFloat(newProduct.salePrice) : undefined,
          costPrice: newProduct.costPrice ? parseFloat(newProduct.costPrice) : undefined,
          image: newProduct.image
      });
      setIsAddingProduct(false);
      setNewProduct({ name: '', quantity: '', minQuantity: '', unit: 'un', isForSale: false, salePrice: '', costPrice: '', image: '' });
      triggerSaveFeedback();
  };

  const calculateProfit = () => {
      const cost = parseFloat(newProduct.costPrice) || 0;
      const sale = parseFloat(newProduct.salePrice) || 0;
      if (sale > 0) {
          const profit = sale - cost;
          const margin = (profit / sale) * 100;
          return { profit, margin };
      }
      return null;
  };
  const profitData = calculateProfit();

  const handleAddTransaction = () => {
      // ... existing handleAddTransaction ...
      if(!newTrans.description || !newTrans.amount) return;
      
      const installments = newTrans.method === 'credit_split' ? parseInt(newTrans.installments) : 1;
      
      const transaction: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          description: newTrans.description + (installments > 1 ? ` (1/${installments})` : ''),
          amount: parseFloat(newTrans.amount) / (installments > 1 ? installments : 1), 
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
        // ... (keep existing dashboard render)
        return (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 overflow-visible relative">
                <div className="flex justify-between items-end mb-2 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold mb-1">
                            <Target className="w-4 h-4 text-brand-500" /> Meta Mensal
                        </div>
                        <div className="text-2xl font-bold">R$ {totalSales.toFixed(0)}</div>
                    </div>
                    <div className="text-right">
                         <div className="text-xs text-gray-400">Objetivo</div>
                         <div className="font-bold">R$ {revenueGoal.toFixed(0)}</div>
                    </div>
                </div>
                <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden relative z-10">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${progressPercent >= 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div className="text-right text-[10px] text-gray-400 mt-1 relative z-10">
                    {progressPercent.toFixed(0)}% alcançado
                </div>
            </Card>

            {birthdaysToday.length > 0 && (
                <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 animate-in slide-in-from-right">
                    <div className="flex items-center gap-2 mb-3">
                        <Gift className="w-5 h-5 text-pink-600" />
                        <h3 className="font-bold text-pink-900">Aniversariantes Hoje</h3>
                    </div>
                    <div className="space-y-2">
                        {birthdaysToday.map(client => (
                            <div key={client.id} className="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm">
                                <span className="text-sm font-medium">{client.name}</span>
                                <a 
                                    href={`https://wa.me/${client.phone}?text=Parabéns ${client.name}! Hoje é seu dia no ${salon.name}. Venha comemorar com a gente!`}
                                    target="_blank"
                                    className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-bold hover:bg-green-600 flex items-center gap-1"
                                >
                                    <MessageCircle className="w-3 h-3" /> Parabéns
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {lostClients.length > 0 && (
                <Card className="border-l-4 border-orange-400">
                    <div className="flex items-center gap-2 mb-3">
                        <Megaphone className="w-5 h-5 text-orange-500" />
                        <h3 className="font-bold text-gray-800">Clientes para Resgatar</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Clientes que não visitam há mais de 30 dias.</p>
                    <div className="space-y-2">
                         {lostClients.map(client => (
                            <div key={client.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                <span className="text-sm text-gray-700">{client.name}</span>
                                <a 
                                    href={`https://wa.me/${client.phone}?text=Olá ${client.name}! Faz tempo que não te vemos no ${salon.name}. Que tal agendar um horário?`}
                                    target="_blank"
                                    className="text-brand-600 hover:text-brand-800"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </a>
                            </div>
                         ))}
                    </div>
                </Card>
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
            
            {isPro && (
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
            )}
          </div>
        );

      case 'inventory':
          // ... (keep existing inventory render)
          return (
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-gray-700">Controle de Estoque</h3>
                      <Button onClick={() => setIsAddingProduct(true)} className="flex items-center gap-1 text-xs">
                          <Plus className="w-3 h-3" /> Novo
                      </Button>
                  </div>

                  {isAddingProduct && (
                      <Card className="bg-blue-50 border-blue-100">
                          <div className="space-y-3">
                              <ImageUpload className="w-full h-32 rounded-lg" currentImage={newProduct.image} placeholder="Foto do Produto" onImageUpload={(b64) => setNewProduct({...newProduct, image: b64})} />
                              <Input label="Nome do Produto" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-white" />
                              <div className="grid grid-cols-3 gap-2">
                                  <Input label="Qtd Atual" type="number" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} className="bg-white" />
                                  <Input label="Mínimo" type="number" value={newProduct.minQuantity} onChange={e => setNewProduct({...newProduct, minQuantity: e.target.value})} className="bg-white" />
                                  <div className="mb-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                                          <option value="un">Un</option>
                                          <option value="ml">ml</option>
                                          <option value="kg">kg</option>
                                          <option value="lt">Litro</option>
                                      </select>
                                  </div>
                              </div>
                              
                              <Input label="Preço de Custo (R$)" type="number" value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: e.target.value})} className="bg-white" />

                              <div className="bg-white p-3 rounded-lg border border-blue-200">
                                  <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                      <input type="checkbox" checked={newProduct.isForSale} onChange={e => setNewProduct({...newProduct, isForSale: e.target.checked})} />
                                      <span className="text-sm font-bold text-gray-800">Disponível para Venda Online?</span>
                                  </label>
                                  {newProduct.isForSale && (
                                      <>
                                        <Input label="Preço de Venda (R$)" type="number" value={newProduct.salePrice} onChange={e => setNewProduct({...newProduct, salePrice: e.target.value})} className="mb-0" />
                                        
                                        {profitData && (
                                            <div className="mt-2 p-2 rounded text-xs flex justify-between items-center bg-green-50 text-green-700">
                                                <span className="font-bold">Lucro: R$ {profitData.profit.toFixed(2)}</span>
                                                <span className="font-mono">Margem: {profitData.margin.toFixed(0)}%</span>
                                            </div>
                                        )}
                                      </>
                                  )}
                              </div>

                              <div className="flex gap-2">
                                  <Button variant="outline" className="flex-1" onClick={() => setIsAddingProduct(false)}>Cancelar</Button>
                                  <Button className="flex-1" onClick={handleSaveProduct}>Salvar</Button>
                              </div>
                          </div>
                      </Card>
                  )}

                  <div className="space-y-2">
                      {salon.products?.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhum produto cadastrado.</p>}
                      {salon.products?.map(prod => (
                          <div key={prod.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center relative overflow-hidden">
                              {prod.isForSale && (
                                  <div className="absolute top-0 right-0 bg-green-50 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                      R$ {prod.salePrice?.toFixed(2)}
                                  </div>
                              )}
                              <div className="flex items-center gap-3">
                                  {prod.image ? (
                                      <img src={prod.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                  ) : (
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                          <Package className="w-6 h-6" />
                                      </div>
                                  )}
                                  <div>
                                      <div className="font-bold text-gray-800 flex items-center gap-2">
                                          {prod.name}
                                          {prod.isForSale && <ShoppingBag className="w-3 h-3 text-green-500" />}
                                      </div>
                                      <div className="text-xs text-gray-500 flex items-center gap-2">
                                          <span>Min: {prod.minQuantity} {prod.unit}</span>
                                          {prod.quantity <= prod.minQuantity && (
                                              <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-1.5 rounded">
                                                  <AlertTriangle className="w-3 h-3" /> Baixo
                                              </span>
                                          )}
                                      </div>
                                      {prod.costPrice && (
                                          <div className="text-[10px] text-gray-400 mt-0.5">Custo: R$ {prod.costPrice.toFixed(2)}</div>
                                      )}
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <button onClick={() => updateProduct(salon.id, prod.id, Math.max(0, prod.quantity - 1))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600">-</button>
                                  <span className="font-mono font-bold w-8 text-center">{prod.quantity}</span>
                                  <button onClick={() => updateProduct(salon.id, prod.id, prod.quantity + 1)} className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center hover:bg-brand-100 text-brand-600">+</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          );

      case 'finance':
        // ... (keep existing finance render)
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
                            const currentMonth = new Date().getMonth();
                            const proAppts = salon.appointments.filter(a => 
                                a.professionalId === pro.id && 
                                a.status === 'completed' &&
                                new Date(a.date).getMonth() === currentMonth
                            );
                            
                            let serviceRevenue = 0;
                            let productRevenue = 0;

                            proAppts.forEach(appt => {
                                const productsTotal = appt.products ? appt.products.reduce((acc, p) => acc + (p.salePrice || 0), 0) : 0;
                                const servicePrice = appt.price - productsTotal; 

                                serviceRevenue += servicePrice;
                                productRevenue += productsTotal;
                            });

                            const serviceCommission = serviceRevenue * (pro.commissionRate / 100);
                            const productCommission = productRevenue * ((pro.productCommissionRate || 0) / 100);
                            const totalCommission = serviceCommission + productCommission;

                            return (
                                <div key={pro.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{pro.name}</div>
                                        <div className="text-[10px] text-gray-500 mt-1 space-y-0.5">
                                            <div>Serviços: R$ {serviceRevenue.toFixed(2)} <span className="text-green-600">({pro.commissionRate}%)</span></div>
                                            <div>Vendas: R$ {productRevenue.toFixed(2)} <span className="text-green-600">({pro.productCommissionRate || 0}%)</span></div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <div className="font-bold text-brand-600 text-sm">
                                            A Pagar: R$ {totalCommission.toFixed(2)}
                                        </div>
                                        {totalCommission > 0 && (
                                            <button 
                                                onClick={() => handlePayCommission(pro.name, totalCommission)}
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
        // ... (keep existing agenda render)
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
                            <Badge color={app.status === 'completed' ? 'green' : (app.status === 'cancelled' ? 'red' : 'blue')}>
                                {app.status === 'completed' ? 'Concluído' : (app.status === 'cancelled' ? 'Cancelado' : 'Agendado')}
                            </Badge>
                        </div>
                        <div className="text-sm text-gray-600 font-medium">{serviceName} com {proName}</div>
                        
                        {app.products && app.products.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-500">
                                <span className="font-bold block mb-1">Compras:</span>
                                {app.products.map(p => (
                                    <span key={p.id} className="bg-gray-100 px-2 py-0.5 rounded mr-1 inline-block mb-1">{p.name}</span>
                                ))}
                            </div>
                        )}

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
        // ... (keep existing team render)
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
                            <div className="flex justify-center gap-1 mt-1 text-xs text-gray-500">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded">S: {pro.commissionRate}%</span>
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded">P: {pro.productCommissionRate || 0}%</span>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                    onClick={() => {
                        setEditingProId(null);
                        setNewPro({ name: '', email: '', commission: '', productCommission: '', avatar: '' });
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
                                <Input placeholder="E-mail de Acesso" type="email" value={newPro.email} onChange={e => setNewPro({...newPro, email: e.target.value})} />
                                {!editingProId && <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">Senha padrão: <strong>123456</strong></div>}
                                <div className="grid grid-cols-2 gap-2">
                                    <Input label="Comissão Serviços (%)" placeholder="Ex: 50" type="number" value={newPro.commission} onChange={e => setNewPro({...newPro, commission: e.target.value})} />
                                    <Input label="Comissão Produtos (%)" placeholder="Ex: 10" type="number" value={newPro.productCommission} onChange={e => setNewPro({...newPro, productCommission: e.target.value})} />
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" className="flex-1" onClick={() => { setIsAddingPro(false); setEditingProId(null); }}>Cancelar</Button>
                                    <Button className="flex-1" onClick={handleSavePro}>Salvar</Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                 )}

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
        // ... (keep existing services render)
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

            <Card title="Galeria de Fotos">
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {salon.gallery?.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                <img src={img} className="w-full h-full object-cover" />
                                <button 
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeGalleryImage(idx)}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <ImageUpload 
                            className="aspect-square rounded-lg" 
                            placeholder="+"
                            onImageUpload={addGalleryImage} 
                        />
                    </div>
                    <p className="text-xs text-gray-500">Adicione fotos dos seus melhores cortes ou do ambiente.</p>
                </div>
            </Card>

             <Card title="Metas & Objetivos">
                <Input 
                    label="Meta de Faturamento Mensal (R$)" 
                    type="number" 
                    value={salon.revenueGoal} 
                    onChange={(e) => updateSettings('revenueGoal', parseFloat(e.target.value))} 
                />
            </Card>

            <Card title="Redes Sociais">
                <div className="space-y-3">
                    <Input label="Instagram" placeholder="@usuario" value={salon.socials?.instagram || ''} onChange={(e) => updateSocials('instagram', e.target.value)} />
                    <Input label="Facebook" placeholder="Link da página" value={salon.socials?.facebook || ''} onChange={(e) => updateSocials('facebook', e.target.value)} />
                    <Input label="WhatsApp" placeholder="Apenas números (Ex: 11999999999)" value={salon.socials?.whatsapp || ''} onChange={(e) => updateSocials('whatsapp', e.target.value)} />
                    <Input label="Website" placeholder="https://..." value={salon.socials?.website || ''} onChange={(e) => updateSocials('website', e.target.value)} />
                </div>
            </Card>

            {/* Nova Seção de Regras */}
            <Card title="Regras de Agendamento">
                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <input
                        type="checkbox"
                        checked={salon.allowClientCancellation ?? true}
                        onChange={(e) => updateSettings('allowClientCancellation', e.target.checked)}
                        className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <div className="flex-1">
                        <span className="text-sm font-bold text-gray-800 block">Permitir cancelamento pelo App?</span>
                        <span className="text-xs text-gray-500">
                            Se desmarcado, o cliente verá uma mensagem pedindo para contatar o estabelecimento.
                        </span>
                    </div>
                </label>
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
                <MobileNavItem icon={<Package />} label="Estoque" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
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
