import React, { createContext, useContext, useState } from 'react';
import { Salon, StoreContextType, Appointment, PlanType } from './types';
import { v4 as uuidv4 } from 'uuid'; // Just mimicking uuid

// Simple mock UUID generator since we don't have the library
const generateId = () => Math.random().toString(36).substr(2, 9);

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
      { id: 'p1', name: 'João Silva', avatarUrl: 'https://picsum.photos/100/100', commissionRate: 50 },
      { id: 'p2', name: 'Pedro Santos', avatarUrl: 'https://picsum.photos/100/101', commissionRate: 40 },
    ],
    appointments: [
       { id: 'a1', salonId: '1', serviceId: 's1', professionalId: 'p1', clientName: 'Carlos', clientPhone: '1199999999', date: new Date().toISOString(), status: 'completed', price: 60 },
       { id: 'a2', salonId: '1', serviceId: 's2', professionalId: 'p2', clientName: 'Marcos', clientPhone: '1199998888', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed', price: 40 },
    ]
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
      { id: 'p3', name: 'Ana Costa', avatarUrl: 'https://picsum.photos/100/102', commissionRate: 60 },
    ],
    appointments: []
  }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [salons, setSalons] = useState<Salon[]>(INITIAL_SALONS);
  const [currentSalonId, setCurrentSalonId] = useState<string | null>(null);

  const updateSalon = (updatedSalon: Salon) => {
    setSalons(prev => prev.map(s => s.id === updatedSalon.id ? updatedSalon : s));
  };

  const addAppointment = (salonId: string, appointment: Appointment) => {
    setSalons(prev => prev.map(s => {
      if (s.id === salonId) {
        return { ...s, appointments: [...s.appointments, appointment] };
      }
      return s;
    }));
  };

  const createSalon = (name: string, plan: PlanType) => {
    const newSalon: Salon = {
      id: generateId(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: 'Novo salão cadastrado.',
      plan,
      address: 'Endereço não informado',
      services: [],
      professionals: [],
      appointments: []
    };
    setSalons(prev => [...prev, newSalon]);
  };

  return (
    <StoreContext.Provider value={{ salons, currentSalonId, setCurrentSalonId, updateSalon, addAppointment, createSalon }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
