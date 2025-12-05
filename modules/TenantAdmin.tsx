
import React, { useState } from 'react';
import { useStore } from '../store';
import { Salon, Service, Professional, Transaction, TransactionType, PaymentMethod, Product } from '../types';
import { Button, Card, Input, Badge, ImageUpload, AppShell, MobileNav, MobileNavItem, Modal } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Calendar, Users, Scissors, DollarSign, Settings, 
  Sparkles, Lock, LogOut, Save, Plus, X, Check, Clock, CreditCard, Ticket,
  TrendingUp, TrendingDown, Wallet, Edit, Banknote, QrCode,
  Target, Package, Megaphone, Gift, AlertTriangle, MessageCircle, ShoppingBag, Trash2, CalendarRange, Ban
} from 'lucide-react';
import { generateSalonDescription } from '../services/geminiService';

export const TenantAdmin: React.FC<{ salonId: string; onBack: () => void }> = ({ salonId, onBack }) => {
  const { salons, clients, updateSalon, addAppointment, addBlockedPeriod, addTransaction, addProduct, updateProduct, removeBlockedPeriod } = useStore();
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
  const [financePeriod, setFinancePeriod] = useState<'today' | 'month'>('month');

  // Block periods
  const [blockType, setBlockType] = useState<'salon' | 'professional'>('salon');
  const [blockDate, setBlockDate] = useState('');
  const [blockProId, setBlockProId] = useState('');
  const [blockRange, setBlockRange] = useState({ start: '', end: '' });
  const [blockMode, setBlockMode] = useState<'date' | 'time'>('date');
  const [blockTime, setBlockTime] = useState({ start: '', end: '' });

  // QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQrPro, setSelectedQrPro] = useState<Professional | null>(null);

  if (!salon) return <div>Salão não encontrado</div>;

  // UNLOCK ALL FEATURES FOR EVERYONE
  const isPro = true; 
  
  // --- DASHBOARD CALCULATIONS ---
  const revenueGoal = salon.revenueGoal || 5000;
  // Calculate daily and weekly goals (Approximation: 26 working days, 4 weeks)
  const dailyGoal = revenueGoal / 26; 
  const weeklyGoal = revenueGoal / 4; 

  // Helpers for date checking
  const isToday = (dateStr: string) => {
      const d = new Date(dateStr);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const isThisWeek = (dateStr: string) => {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = Math.abs(now.getTime() - d.getTime());
      return diff < (7 * 24 * 60 * 60 * 1000);
  };

  const isThisMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  // --- GLOBAL SALON METRICS ---
  const salonMetrics = {
      today: salon.appointments.filter(a => a.status === 'completed' && isToday(a.date)).reduce((acc, curr) => acc + curr.price, 0),
      weekly: salon.appointments.filter(a => a.status === 'completed' && isThisWeek(a.date)).reduce((acc, curr) => acc + curr.price, 0),
      monthly: salon.appointments.filter(a => a.status === 'completed' && isThisMonth(a.date)).reduce((acc, curr) => acc + curr.price, 0),
  };

  const salonProgress = {
      today: Math.min((salonMetrics.today / dailyGoal) * 100, 100),
      weekly: Math.min((salonMetrics.weekly / weeklyGoal) * 100, 100),
      monthly: Math.min((salonMetrics.monthly / revenueGoal) * 100, 100),
  };

  // Define totalSales (Lifetime revenue from completed appointments)
  const totalSales = salon.appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => {
      const productsTotal = curr.products ? curr.products.reduce((sum, p) => sum + (p.salePrice || 0), 0) : 0;
      return acc + curr.price + productsTotal;
    }, 0);

  // --- OWNER PERSONAL METRICS (If Owner is also a Professional) ---
  const ownerProProfile = salon.professionals.find(p => p.email === salon.ownerEmail);
  const isOwnerPro = !!ownerProProfile;
  
  const ownerMetrics = ownerProProfile ? {
      today: salon.appointments.filter(a => a.professionalId === ownerProProfile.id && a.status === 'completed' && isToday(a.date)).reduce((acc, curr) => acc + curr.price, 0),
      weekly: salon.appointments.filter(a => a.professionalId === ownerProProfile.id && a.status === 'completed' && isThisWeek(a.date)).reduce((acc, curr) => acc + curr.price, 0),
      monthly: salon.appointments.filter(a => a.professionalId === ownerProProfile.id && a.status === 'completed' && isThisMonth(a.date)).reduce((acc, curr) => acc + curr.price, 0),
  } : null;

  // Personal goal can be defined as a % of the total goal or a fixed value. 
  // For MVP, let's assume the owner wants to contribute at least 30% of the revenue personally if they work.
  const personalGoalShare = 0.3; 
  const ownerProgress = ownerMetrics ? {
      today: Math.min((ownerMetrics.today / (dailyGoal * personalGoalShare)) * 100, 100),
      weekly: Math.min((ownerMetrics.weekly / (weeklyGoal * personalGoalShare)) * 100, 100),
      monthly: Math.min((ownerMetrics.monthly / (revenueGoal * personalGoalShare)) * 100, 100),
  } : null;

  // Filter transactions based on period for Finance Tab
  const filterDate = new Date();
  const transactionFilter = (t: Transaction) => {
      const tDate = new Date(t.date);
      if (financePeriod === 'today') {
          return tDate.getDate() === filterDate.getDate() && tDate.getMonth() === filterDate.getMonth() && tDate.getFullYear() === filterDate.getFullYear();
      } else {
          return tDate.getMonth() === filterDate.getMonth() && tDate.getFullYear() === filterDate.getFullYear();
      }
  };

  const filteredTransactions = salon.transactions.filter(transactionFilter);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const topServicesData = salon.services.map(s => ({
    name: s.name,
    count: salon.appointments.filter(a => a.serviceId === s.id).length
  })).sort((a, b) => b.count - a.count).slice(0, 5);

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
    if (!newPro.name || !newPro.email) {
        alert("Preencha nome e e-mail.");
        return;
    }
    
    // Validate Email Uniqueness (Simple check)
    const emailExists = salons.some(s => 
        s.id !== salon.id && 
        s.professionals.some(p => p.email === newPro.email) 
    );
    const emailExistsInCurrent = salon.professionals.some(p => p.email === newPro.email && p.id !== editingProId);

    if (emailExists || emailExistsInCurrent) {
        alert("Este e-mail já está em uso por outro profissional.");
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

  const handleToggleOwnerPro = (enabled: boolean) => {
      if (enabled) {
          // Add owner as professional
          if (!ownerProProfile && salon.ownerEmail) {
              const pro: Professional = {
                  id: Math.random().toString(36).substr(2, 9),
                  name: salon.name.split(' ')[0] + ' (Proprietário)', // Default name
                  email: salon.ownerEmail,
                  avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(salon.name)}&background=e11d48&color=fff`,
                  commissionRate: 100, // Owners usually keep 100% or adjust later
                  productCommissionRate: 100,
                  password: salon.password 
              };
              updateSalon({ ...salon, professionals: [...salon.professionals, pro] });
          }
      } else {
          // Remove owner from professionals
          if (ownerProProfile) {
              const updatedPros = salon.professionals.filter(p => p.id !== ownerProProfile.id);
              updateSalon({ ...salon, professionals: updatedPros });
          }
      }
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
          reason: blockMode === 'time' ? `Bloqueio: ${blockTime.start}-${blockTime.end}` : 'Bloqueio Dia Inteiro'
      });
      setBlockDate('');
      triggerSaveFeedback();
  };

  const handleRemoveBlock = (blockId: string) => {
      removeBlockedPeriod(salon.id, blockId);
      triggerSaveFeedback();
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-4">
            {/* --- CARD 1: METAS DO SALÃO (GLOBAL) --- */}
            <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 overflow-visible relative pb-6">
                <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold mb-1">
                            <Target className="w-4 h-4 text-brand-500" /> Faturamento Global (Salão)
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4 relative z-10">
                    {/* Diário */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Hoje</span>
                            <span className="font-bold">R$ {salonMetrics.today.toFixed(0)} / {dailyGoal.toFixed(0)}</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${salonProgress.today}%` }}></div>
                        </div>
                    </div>
                    {/* Semanal */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Semana</span>
                            <span className="font-bold">R$ {salonMetrics.weekly.toFixed(0)} / {weeklyGoal.toFixed(0)}</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all" style={{ width: `${salonProgress.weekly}%` }}></div>
                        </div>
                    </div>
                    {/* Mensal */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">Mês</span>
                            <span className="font-bold">R$ {salonMetrics.monthly.toFixed(0)} / {revenueGoal.toFixed(0)}</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${salonProgress.monthly >= 100 ? 'bg-green-500' : 'bg-brand-500'}`} style={{ width: `${salonProgress.monthly}%` }}></div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* --- CARD 2: PRODUTIVIDADE PESSOAL (SE DONO FOR PROFISSIONAL) --- */}
            {isOwnerPro && ownerMetrics && ownerProgress && (
                <Card className="bg-white border border-brand-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 text-brand-600" />
                        <h3 className="font-bold text-gray-900 text-sm">Minha Produção (Pessoal)</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        {/* Hoje */}
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <span className="text-[10px] text-gray-500 uppercase block">Hoje</span>
                            <span className="font-bold text-gray-800 text-sm">R$ {ownerMetrics.today.toFixed(0)}</span>
                            <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-blue-400" style={{ width: `${ownerProgress.today}%` }}></div>
                            </div>
                        </div>
                        {/* Semana */}
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <span className="text-[10px] text-gray-500 uppercase block">Semana</span>
                            <span className="font-bold text-gray-800 text-sm">R$ {ownerMetrics.weekly.toFixed(0)}</span>
                            <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-purple-400" style={{ width: `${ownerProgress.weekly}%` }}></div>
                            </div>
                        </div>
                        {/* Mês */}
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <span className="text-[10px] text-gray-500 uppercase block">Mês</span>
                            <span className="font-bold text-brand-600 text-sm">R$ {ownerMetrics.monthly.toFixed(0)}</span>
                            <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-brand-500" style={{ width: `${ownerProgress.monthly}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 text-center">
                        Isso é o que você gerou individualmente com seus atendimentos.
                    </p>
                </Card>
            )}

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
                    <div className="text-xs text-gray-500 uppercase">Total Receita</div>
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

      case 'team':
        return (
            <div className="space-y-4">
                 {/* Toggle Owner as Professional */}
                 <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl flex items-center justify-between">
                     <div>
                         <h3 className="font-bold text-brand-900 text-sm">Você também atende clientes?</h3>
                         <p className="text-xs text-brand-700 mt-1">Ao ativar, você aparecerá na agenda e terá metas pessoais.</p>
                     </div>
                     <div className="flex gap-2">
                         <button 
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${isOwnerPro ? 'bg-brand-600 text-white' : 'bg-white text-brand-600 border border-brand-200'}`}
                            onClick={() => handleToggleOwnerPro(true)}
                         >
                             Sim
                         </button>
                         <button 
                            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${!isOwnerPro ? 'bg-gray-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                            onClick={() => handleToggleOwnerPro(false)}
                         >
                             Não
                         </button>
                     </div>
                 </div>

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

      case 'finance':
        return (
            <div className="space-y-6">
                {/* Filtro de Período */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${financePeriod === 'today' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        onClick={() => setFinancePeriod('today')}
                    >
                        Hoje
                    </button>
                    <button 
                        className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${financePeriod === 'month' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        onClick={() => setFinancePeriod('month')}
                    >
                        Este Mês
                    </button>
                </div>

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
                    <h3 className="font-bold text-gray-700 text-sm">Lançamentos ({financePeriod === 'today' ? 'Hoje' : 'Este Mês'})</h3>
                    {filteredTransactions.slice().reverse().map(t => (
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
                    {filteredTransactions.length === 0 && <p className="text-gray-400 text-sm text-center">Nenhum lançamento no período.</p>}
                </div>
            </div>
        );

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
