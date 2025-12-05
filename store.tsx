
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Salon, StoreContextType, Appointment, PlanType, BlockedPeriod, Client, SaaSPlan, Coupon, Transaction, Product, Service, Professional } from './types';
import { supabase } from './services/supabaseClient';

// Simple mock UUID generator (fallback)
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
    ownerEmail: 'contato@vintage.com',
    password: '123',
    slug: 'vintage-barber',
    description: 'Estilo clássico para o homem moderno.',
    plan: 'professional',
    address: 'Rua Augusta, 123 - SP',
    services: [
      { id: 's1', name: 'Corte de Cabelo', durationMinutes: 45, price: 60 },
      { id: 's2', name: 'Barba Completa', durationMinutes: 30, price: 40 },
    ],
    professionals: [
      { id: 'p1', name: 'João Silva', email: 'joao@vintage.com', avatarUrl: 'https://i.pravatar.cc/150?u=1', commissionRate: 50, productCommissionRate: 10, password: '123' },
      { id: 'p2', name: 'Pedro Santos', email: 'pedro@vintage.com', avatarUrl: 'https://i.pravatar.cc/150?u=2', commissionRate: 40, productCommissionRate: 15, password: '123' },
    ],
    appointments: [
        // Adicionando histórico para o cliente de teste ver nos favoritos
        { 
            id: 'appt-demo-1', 
            salonId: '1', 
            serviceId: 's1', 
            professionalId: 'p1', 
            clientName: 'Carlos Cliente', 
            clientPhone: '11999990000', 
            date: new Date(Date.now() - 5 * 86400000).toISOString(), 
            status: 'completed', 
            price: 60 
        }
    ],
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
    allowClientCancellation: true,
    coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000',
    aboutUs: 'Fundada em 2015, a Barbearia Vintage traz o conceito das clássicas barbearias nova-iorquinas para o coração de São Paulo. Aqui você encontra cerveja gelada, boa conversa e um corte impecável.',
    socials: {
        instagram: '@barbeariavintage',
        whatsapp: '11999999999',
        website: 'www.vintage.com.br'
    },
    gallery: [
        'https://images.unsplash.com/photo-1599351431202-6e0005079746?auto=format&fit=crop&q=80&w=500',
        'https://images.unsplash.com/photo-1503951914875-befbb7470d03?auto=format&fit=crop&q=80&w=500',
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=500'
    ],
    subscriptionStatus: 'active',
    monthlyFee: 39.90, 
    nextBillingDate: new Date(Date.now() + 15 * 86400000).toISOString()
  },
  {
    id: '2',
    name: 'Lava Rápido Turbo',
    ownerEmail: 'gerente@lavarapidoturbo.com',
    password: '123',
    slug: 'lava-rapido-turbo',
    description: 'Seu carro novo de novo em minutos.',
    plan: 'start',
    address: 'Av. dos Bandeirantes, 1500 - SP',
    services: [
      { id: 's3', name: 'Lavagem Simples', durationMinutes: 40, price: 50 },
      { id: 's4', name: 'Lavagem Com Cera', durationMinutes: 60, price: 80 },
      { id: 's5', name: 'Higienização Interna', durationMinutes: 120, price: 200 },
    ],
    professionals: [
      { id: 'p3', name: 'Equipe Box 1', email: 'box1@lavarapidoturbo.com', avatarUrl: 'https://images.unsplash.com/photo-1605218427306-635ba2439715?auto=format&fit=crop&q=80&w=200', commissionRate: 30, productCommissionRate: 5, password: '123' },
      { id: 'p4', name: 'Equipe Box 2', email: 'box2@lavarapidoturbo.com', avatarUrl: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?auto=format&fit=crop&q=80&w=200', commissionRate: 30, productCommissionRate: 5, password: '123' },
    ],
    appointments: [
        { 
            id: 'appt-demo-2', 
            salonId: '2', 
            serviceId: 's3', 
            professionalId: 'p3', 
            clientName: 'Carlos Cliente', 
            clientPhone: '11999990000', 
            date: new Date(Date.now() - 2 * 86400000).toISOString(), 
            status: 'completed', 
            price: 50 
        }
    ],
    transactions: [],
    products: [
        { id: 'prod-auto-1', name: 'Aromatizante Carro Novo', quantity: 50, minQuantity: 10, unit: 'un', isForSale: true, salePrice: 15, costPrice: 5, image: 'https://images.unsplash.com/photo-1550963295-019d8a8a61c5?auto=format&fit=crop&q=80&w=200' },
        { id: 'prod-auto-2', name: 'Pretinho Pneu', quantity: 20, minQuantity: 5, unit: 'un', isForSale: true, salePrice: 25, costPrice: 10, image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=200' }
    ],
    category: 'Automotivo',
    openTime: '08:00',
    closeTime: '18:00',
    slotInterval: 40,
    blockedPeriods: [],
    revenueGoal: 20000,
    allowClientCancellation: false,
    coverImage: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=1000',
    aboutUs: 'Especialistas em estética automotiva. Utilizamos apenas produtos biodegradáveis de alta performance.',
    socials: {
        instagram: '@lavarapidoturbo'
    },
    gallery: [
        'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=500',
        'https://images.unsplash.com/photo-1520340356584-7eb3cb40645e?auto=format&fit=crop&q=80&w=500'
    ],
    subscriptionStatus: 'active',
    monthlyFee: 0,
    nextBillingDate: new Date(Date.now() + 10 * 86400000).toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [
    { id: 'c1', code: 'PROMO10', discountPercent: 10, active: true, uses: 5 },
    { id: 'c2', code: 'BEMVINDO', discountPercent: 20, active: true, uses: 12 }
];

const INITIAL_CLIENTS: Client[] = [
    { id: 'c1', name: 'Carlos Cliente', phone: '11999990000', birthDate: new Date().toISOString().split('T')[0] },
    { id: 'c2', name: 'Maria Souza', phone: '11999991111', birthDate: '1990-05-15' },
    { id: 'c3', name: 'Pedro Cliente', phone: '11988887777', birthDate: '1985-01-01' }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization
  const [salons, setSalons] = useState<Salon[]>(INITIAL_SALONS);
  const [saasPlans, setSaasPlans] = useState<SaaSPlan[]>(INITIAL_PLANS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  
  const [currentSalonId, setCurrentSalonId] = useState<string | null>(null);
  const saasRevenueGoal = 5000;
  const [isLoading, setIsLoading] = useState(true);

  // --- SUPABASE DATA FETCHING ---
  const loadDataFromSupabase = async () => {
    if (!supabase) return false;

    try {
        // Fetch base tables
        const { data: salonsData } = await supabase.from('salons').select('*');
        const { data: servicesData } = await supabase.from('services').select('*');
        const { data: professionalsData } = await supabase.from('professionals').select('*');
        const { data: appointmentsData } = await supabase.from('appointments').select('*');
        const { data: productsData } = await supabase.from('products').select('*');
        const { data: transactionsData } = await supabase.from('transactions').select('*');
        const { data: clientsData } = await supabase.from('clients').select('*');
        
        // Reconstruct nested Salon objects
        if (salonsData) {
            const fullSalons: Salon[] = salonsData.map(s => ({
                ...s,
                services: servicesData?.filter(svc => svc.salon_id === s.id) || [],
                professionals: professionalsData?.filter(p => p.salon_id === s.id) || [],
                appointments: appointmentsData?.filter(a => a.salon_id === s.id) || [],
                products: productsData?.filter(p => p.salon_id === s.id) || [],
                transactions: transactionsData?.filter(t => t.salon_id === s.id) || [],
                blockedPeriods: [],
                allowClientCancellation: true // Default if column doesn't exist
            }));
            setSalons(fullSalons);
        }

        if (clientsData) {
            // Map back snake_case to camelCase
            const mappedClients = clientsData.map((c: any) => ({
                id: c.id,
                name: c.name,
                phone: c.phone,
                birthDate: c.birth_date
            }));
            setClients(mappedClients);
        }
        
        return true;
    } catch (error) {
        console.error("Supabase load error:", error);
        return false;
    }
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    const init = async () => {
        setIsLoading(true);
        const connected = await loadDataFromSupabase();
        
        if (!connected) {
            // Fallback to LocalStorage if Supabase is not configured or fails
            const savedSalons = localStorage.getItem('salons');
            if (savedSalons) setSalons(JSON.parse(savedSalons));
            
            const savedPlans = localStorage.getItem('saasPlans');
            if (savedPlans) setSaasPlans(JSON.parse(savedPlans));

            const savedClients = localStorage.getItem('clients');
            if (savedClients) setClients(JSON.parse(savedClients));
        }
        setIsLoading(false);
    };
    init();
  }, []);

  // Sync to LocalStorage (Backup for Hybrid mode)
  useEffect(() => {
      if (!supabase) {
          localStorage.setItem('salons', JSON.stringify(salons));
          localStorage.setItem('saasPlans', JSON.stringify(saasPlans));
          localStorage.setItem('coupons', JSON.stringify(coupons));
          localStorage.setItem('clients', JSON.stringify(clients));
      }
  }, [salons, saasPlans, coupons, clients]);

  // --- ACTIONS ---

  const updateSalon = async (updatedSalon: Salon) => {
    // Optimistic Update
    setSalons(prev => prev.map(s => s.id === updatedSalon.id ? updatedSalon : s));
    
    if (supabase) {
        const { id, name, description, address, openTime, closeTime, coverImage, aboutUs, revenueGoal } = updatedSalon;
        await supabase.from('salons').update({ 
            name, description, address, open_time: openTime, close_time: closeTime, cover_image: coverImage, about_us: aboutUs, revenue_goal: revenueGoal 
        }).eq('id', id);
    }
  };

  const createSalon = async (name: string, plan: PlanType, address: string, ownerName?: string, email?: string, password?: string, couponCode?: string) => {
    const selectedPlan = saasPlans.find(p => p.id === plan);
    let fee = selectedPlan?.price || 0;
    
    if (couponCode) {
        const coupon = coupons.find(c => c.code === couponCode && c.active);
        if (coupon) {
            fee = fee - ((fee * coupon.discountPercent) / 100);
        }
    }

    const newSalon: Salon = {
      id: generateId(),
      name,
      ownerEmail: email || `admin@${name.toLowerCase().replace(/\s+/g, '')}.com`, 
      password: password || '123',
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: 'Novo salão.',
      plan,
      address: address, // Using passed address
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
      revenueGoal: 5000,
      allowClientCancellation: true
    };

    setSalons(prev => [...prev, newSalon]);

    if (supabase) {
        // Map to DB columns
        await supabase.from('salons').insert([{
            id: newSalon.id,
            name: newSalon.name,
            plan: newSalon.plan,
            address: newSalon.address,
            monthly_fee: newSalon.monthlyFee,
            subscription_status: 'active'
        }]);
    }
  };

  const addAppointment = async (salonId: string, appointment: Appointment) => {
    setSalons(prev => prev.map(s => {
      if (s.id === salonId) {
        let totalAmount = appointment.price;
        if (appointment.products) {
            totalAmount += appointment.products.reduce((acc, p) => acc + (p.salePrice || 0), 0);
        }

        const newTransaction: Transaction = {
            id: generateId(),
            description: `Agendamento: ${appointment.clientName}`,
            amount: totalAmount,
            type: 'income',
            date: appointment.date.split('T')[0],
            category: 'Serviços',
            paymentMethod: 'cash',
            isAutoGenerated: true
        };
        
        return { 
            ...s, 
            appointments: [...s.appointments, { ...appointment, price: totalAmount }],
            transactions: [...s.transactions, newTransaction]
        };
      }
      return s;
    }));

    if (supabase) {
        // Insert into appointments table
        await supabase.from('appointments').insert([{
            salon_id: salonId,
            client_name: appointment.clientName,
            client_phone: appointment.clientPhone,
            date: appointment.date,
            service_id: appointment.serviceId,
            professional_id: appointment.professionalId,
            price: appointment.price,
            status: 'scheduled',
            products: appointment.products // Stores JSONB for products
        }]);
    }
  };

  const cancelAppointment = (salonId: string, appointmentId: string) => {
      setSalons(prev => prev.map(s => {
          if (s.id === salonId) {
              return {
                  ...s,
                  appointments: s.appointments.map(a => 
                      a.id === appointmentId ? { ...a, status: 'cancelled' } : a
                  )
              };
          }
          return s;
      }));
      if (supabase) {
          supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId);
      }
  };

  const addProduct = async (salonId: string, product: Product) => {
      setSalons(prev => prev.map(s => {
          if(s.id === salonId) {
              return { ...s, products: [...s.products, product] };
          }
          return s;
      }));

      if(supabase) {
          await supabase.from('products').insert([{
              id: product.id, // Ensure UUID or let DB generate
              salon_id: salonId,
              name: product.name,
              quantity: product.quantity,
              sale_price: product.salePrice,
              cost_price: product.costPrice,
              is_for_sale: product.isForSale,
              image: product.image
          }]);
      }
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
      if (supabase) {
          supabase.from('products').update({ quantity }).eq('id', productId);
      }
  };

  const addBlockedPeriod = (salonId: string, blockedPeriod: BlockedPeriod) => {
     setSalons(prev => prev.map(s => {
      if (s.id === salonId) {
        return { ...s, blockedPeriods: [...(s.blockedPeriods || []), blockedPeriod] };
      }
      return s;
    }));
  };

  const saveClient = (client: Client) => {
      setClients(prev => {
          if (prev.some(c => c.phone === client.phone)) return prev;
          return [...prev, client];
      });
      if(supabase) {
          supabase.from('clients').insert([{
              id: client.id,
              name: client.name,
              phone: client.phone,
              birth_date: client.birthDate
          }]).then(r => {
              if (r.error) console.error("Client save error", r.error);
          });
      }
  };

  const getClientByPhone = (phone: string) => {
      return clients.find(c => c.phone === phone);
  };

  const addTransaction = (salonId: string, transaction: Transaction) => {
      setSalons(prev => prev.map(s => {
          if (s.id !== salonId) return s;
          return { ...s, transactions: [...s.transactions, transaction] };
      }));
      if (supabase) {
          supabase.from('transactions').insert([{
              salon_id: salonId,
              description: transaction.description,
              amount: transaction.amount,
              type: transaction.type,
              category: transaction.category,
              date: transaction.date,
              payment_method: transaction.paymentMethod
          }]);
      }
  };
  
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
              const newStatus = s.subscriptionStatus === 'active' ? 'late' : 'active';
              if(supabase) {
                  supabase.from('salons').update({ subscription_status: newStatus }).eq('id', salonId);
              }
              return { 
                  ...s, 
                  subscriptionStatus: newStatus
              };
          }
          return s;
      }));
  };

  return (
    <StoreContext.Provider value={{ 
        salons, saasPlans, coupons, clients, saasRevenueGoal, currentSalonId, 
        setCurrentSalonId, updateSalon, addAppointment, createSalon, 
        addBlockedPeriod, saveClient, getClientByPhone, cancelAppointment,
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
