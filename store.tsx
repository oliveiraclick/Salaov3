
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Salon, StoreContextType, Appointment, PlanType, BlockedPeriod, Client, SaaSPlan, Coupon, Transaction, Product } from './types';

// Simple mock UUID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_PLANS: SaaSPlan[] = [
  {
    id: 'start',
    name: 'Start',
    price: 0,
    perProfessionalPrice: 0,
    maxProfessionals: 1,
    features: ['Agenda Simples', 'Link Personalizado', 'Até 50 agendamentos/mês']
  },
  {
    id: 'professional',
    name: 'Profissional',
    price: 29.90,
    perProfessionalPrice: 10,
    maxProfessionals: 1,
    isRecommended: true,
    features: ['Agenda Ilimitada', 'Controle Financeiro', 'Gestão de Estoque', 'Site Próprio']
  },
  {
    id: 'redes',
    name: 'Redes',
    price: 19.90,
    perProfessionalPrice: 10,
    maxProfessionals: 11,
    features: ['Múltiplos Profissionais (+10)', 'Dashboard Avançado', 'Campanhas de Marketing', 'Suporte Prioritário']
  }
];

const INITIAL_SALONS: Salon[] = [
  {
    id: '1',
    name: 'Barbearia Vintage',
    slug: 'vintage-barber',
    description: 'Estilo clássico para o homem moderno.',
    plan: 'professional',
    address: 'Rua Augusta, 123 - SP',
    services: [
      { id: 's1', name: 'Corte de Cabelo', durationMinutes: 45, price: 60 },
      { id: 's2', name: 'Barba Completa', durationMinutes: 30, price: 40 },
    ],
    professionals: [
      { id: 'p1', name: 'João Silva', avatarUrl: 'https://i.pravatar.cc/150?u=1', commissionRate: 50, productCommissionRate: 10, password: '123' },
      { id: 'p2', name: 'Pedro Santos', avatarUrl: 'https://i.pravatar.cc/150?u=2', commissionRate: 40, productCommissionRate: 15, password: '123' },
    ],
    appointments: [],
    transactions: [], 
    products: [
        { id: 'prod1', name: 'Cera Modeladora', quantity: 15, minQuantity: 5, unit: 'un', isForSale: true, salePrice: 45, costPrice: 20, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200' },
        { id: 'prod2', name: 'Shampoo Premium', quantity: 2, minQuantity: 4, unit: 'frasco', isForSale: true, salePrice: 80, costPrice: 40, image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=80&w=200' },
        { id: 'prod3', name: 'Toalhas Descartáveis', quantity: 100, minQuantity: 50, unit: 'un', isForSale: false, costPrice: 0.50 }
    ],
    category: 'Barbearia',
    openTime: '09:00',
    closeTime: '20:00',
    slotInterval: 30,
    blockedPeriods: [],
    revenueGoal: 15000,
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000',
    aboutUs: 'Fundada em 2015, a Barbearia Vintage traz o conceito das clássicas barbearias nova-iorquinas para o coração de São Paulo. Aqui você encontra cerveja gelada, boa conversa e um corte impecável.',
    socials: {
        instagram: '@barbeariavintage',
        whatsapp: '11999999999',
        website: 'www.vintage.com.br'
    },
    subscriptionStatus: 'active',
    monthlyFee: 39.90, 
    nextBillingDate: new Date(Date.now() + 15 * 86400000).toISOString()
  },
  {
    id: '2',
    name: 'Studio Bella',
    slug: 'studio-bella',
    description: 'Sua beleza em primeiro lugar.',
    plan: 'start',
    address: 'Av. Paulista, 2000 - SP',
    services: [
      { id: 's3', name: 'Manicure', durationMinutes: 60, price: 50 },
    ],
    professionals: [
      { id: 'p3', name: 'Ana Costa', avatarUrl: 'https://i.pravatar.cc/150?u=3', commissionRate: 60, productCommissionRate: 10, password: '123' },
    ],
    appointments: [],
    transactions: [],
    products: [],
    category: 'Salão',
    openTime: '10:00',
    closeTime: '19:00',
    slotInterval: 60,
    blockedPeriods: [],
    revenueGoal: 5000,
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000',
    aboutUs: 'Especialistas em realçar a sua beleza natural. Ambiente climatizado e profissionais altamente qualificados.',
    socials: {
        instagram: '@studiobella'
    },
    subscriptionStatus: 'active',
    monthlyFee: 0,
    nextBillingDate: new Date(Date.now() + 10 * 86400000).toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [
    { id: 'c1', code: 'PROMO10', discountPercent: 10, active: true, uses: 5 },
    { id: 'c2', code: 'BEMVINDO', discountPercent: 20, active: true, uses: 12 }
];

// Mock Client Data to verify Birthday functionality
const INITIAL_CLIENTS: Client[] = [
    { id: 'c1', name: 'Carlos Cliente', phone: '11999990000', birthDate: new Date().toISOString().split('T')[0] }, // Birthday Today
    { id: 'c2', name: 'Maria Souza', phone: '11999991111', birthDate: '1990-05-15' },
    { id: 'c3', name: 'Pedro Cliente', phone: '11988887777', birthDate: '1985-01-01' }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage or use initial
  const [salons, setSalons] = useState<Salon[]>(() => {
      const saved = localStorage.getItem('salons');
      return saved ? JSON.parse(saved) : INITIAL_SALONS;
  });
  
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>(() => {
      const saved = localStorage.getItem('saasPlans');
      return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
      const saved = localStorage.getItem('coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
      const saved = localStorage.getItem('clients');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [currentSalonId, setCurrentSalonId] = useState<string | null>(null);
  
  const saasRevenueGoal = 5000; // Mock SaaS Goal

  // Persistence
  useEffect(() => localStorage.setItem('salons', JSON.stringify(salons)), [salons]);
  useEffect(() => localStorage.setItem('saasPlans', JSON.stringify(saasPlans)), [saasPlans]);
  useEffect(() => localStorage.setItem('coupons', JSON.stringify(coupons)), [coupons]);
  useEffect(() => localStorage.setItem('clients', JSON.stringify(clients)), [clients]);

  const updateSalon = (updatedSalon: Salon) => {
    setSalons(prev => prev.map(s => s.id === updatedSalon.id ? updatedSalon : s));
  };

  const addAppointment = (salonId: string, appointment: Appointment) => {
    setSalons(prev => prev.map(s => {
      if (s.id === salonId) {
        // Calculate Total Price (Service + Products)
        let totalAmount = appointment.price;
        if (appointment.products) {
            totalAmount += appointment.products.reduce((acc, p) => acc + (p.salePrice || 0), 0);
        }

        // Auto-create income transaction for completed appointments (simulated for scheduled too for MVP simplicity)
        const newTransaction: Transaction = {
            id: generateId(),
            description: `Agendamento: ${appointment.clientName}${appointment.products?.length ? ' + Produtos' : ''}`,
            amount: totalAmount,
            type: 'income',
            date: appointment.date.split('T')[0],
            category: 'Serviços',
            paymentMethod: 'cash', // Default
            isAutoGenerated: true
        };
        
        // Decrement product stock if any products were bought
        let updatedProducts = [...s.products];
        if (appointment.products) {
            appointment.products.forEach(boughtProd => {
                updatedProducts = updatedProducts.map(p => 
                    p.id === boughtProd.id ? { ...p, quantity: Math.max(0, p.quantity - 1) } : p
                );
            });
        }

        return { 
            ...s, 
            products: updatedProducts,
            appointments: [...s.appointments, { ...appointment, price: totalAmount }], // Store total price
            transactions: [...s.transactions, newTransaction] // Auto-add to finance
        };
      }
      return s;
    }));
  };

  const addBlockedPeriod = (salonId: string, blockedPeriod: BlockedPeriod) => {
     setSalons(prev => prev.map(s => {
      if (s.id === salonId) {
        return { ...s, blockedPeriods: [...(s.blockedPeriods || []), blockedPeriod] };
      }
      return s;
    }));
  };

  const addTransaction = (salonId: string, transaction: Transaction) => {
      setSalons(prev => prev.map(s => {
          if (s.id !== salonId) return s;

          let newTransactions = [...s.transactions, transaction];

          // Handle Installments logic
          if (transaction.paymentMethod === 'credit_split' && transaction.installments) {
              const totalInstallments = transaction.installments.total;
              const baseDate = new Date(transaction.date);
              
              // We already added the first one (current: 1). Add the rest.
              for (let i = 1; i < totalInstallments; i++) {
                  const nextDate = new Date(baseDate);
                  nextDate.setMonth(baseDate.getMonth() + i);
                  
                  newTransactions.push({
                      ...transaction,
                      id: generateId(),
                      date: nextDate.toISOString().split('T')[0],
                      description: `${transaction.description} (${i + 1}/${totalInstallments})`,
                      installments: {
                          current: i + 1,
                          total: totalInstallments
                      }
                  });
              }
          }
          
          return { ...s, transactions: newTransactions };
      }));
  };

  const addProduct = (salonId: string, product: Product) => {
      setSalons(prev => prev.map(s => {
          if(s.id === salonId) {
              return { ...s, products: [...s.products, product] };
          }
          return s;
      }));
  };

  const updateProduct = (salonId: string, productId: string, quantity: number) => {
       setSalons(prev => prev.map(s => {
          if(s.id === salonId) {
              return { 
                  ...s, 
                  products: s.products.map(p => p.id === productId ? { ...p, quantity } : p) 
              };
          }
          return s;
      }));
  };

  const createSalon = (name: string, plan: PlanType, couponCode?: string) => {
    const selectedPlan = saasPlans.find(p => p.id === plan);
    let fee = selectedPlan?.price || 0;
    
    // Apply Coupon Logic
    if (couponCode) {
        const coupon = coupons.find(c => c.code === couponCode && c.active);
        if (coupon) {
            const discount = (fee * coupon.discountPercent) / 100;
            fee = fee - discount;
            // Update coupon usage
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, uses: c.uses + 1 } : c));
        }
    }
    
    const newSalon: Salon = {
      id: generateId(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: 'Novo salão cadastrado.',
      plan,
      address: 'Endereço não informado',
      services: [],
      professionals: [],
      appointments: [],
      transactions: [],
      products: [],
      category: 'Salão',
      openTime: '09:00',
      closeTime: '18:00',
      slotInterval: 30,
      blockedPeriods: [],
      subscriptionStatus: 'active',
      monthlyFee: fee,
      appliedCoupon: couponCode,
      nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      revenueGoal: 5000
    };
    setSalons(prev => [...prev, newSalon]);
  };

  const saveClient = (client: Client) => {
      setClients(prev => {
          if (prev.some(c => c.phone === client.phone)) return prev;
          return [...prev, client];
      });
  };

  const getClientByPhone = (phone: string) => {
      return clients.find(c => c.phone === phone);
  };

  // SaaS Admin Actions
  const updateSaaSPlan = (updatedPlan: SaaSPlan) => {
      setSaasPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const createCoupon = (code: string, percent: number) => {
      setCoupons(prev => [...prev, {
          id: generateId(),
          code: code.toUpperCase(),
          discountPercent: percent,
          active: true,
          uses: 0
      }]);
  };

  const toggleSalonStatus = (salonId: string) => {
      setSalons(prev => prev.map(s => {
          if (s.id === salonId) {
              return { 
                  ...s, 
                  subscriptionStatus: s.subscriptionStatus === 'active' ? 'late' : 'active'
              };
          }
          return s;
      }));
  };

  return (
    <StoreContext.Provider value={{ 
        salons, saasPlans, coupons, clients, saasRevenueGoal, currentSalonId, 
        setCurrentSalonId, updateSalon, addAppointment, createSalon, 
        addBlockedPeriod, saveClient, getClientByPhone,
        addTransaction, updateSaaSPlan, createCoupon, toggleSalonStatus,
        addProduct, updateProduct
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
