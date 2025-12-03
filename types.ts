export type PlanType = 'start' | 'professional';

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

export interface Professional {
  id: string;
  name: string;
  avatarUrl: string;
  commissionRate: number;
}

export interface Appointment {
  id: string;
  salonId: string;
  serviceId: string;
  professionalId: string;
  clientName: string;
  clientPhone: string;
  date: string; // ISO string
  status: 'scheduled' | 'completed' | 'cancelled';
  price: number;
}

export interface Salon {
  id: string;
  name: string;
  slug: string; // for url simulation
  description: string;
  plan: PlanType;
  services: Service[];
  professionals: Professional[];
  appointments: Appointment[];
  address: string;
}

export interface StoreContextType {
  salons: Salon[];
  currentSalonId: string | null;
  setCurrentSalonId: (id: string | null) => void;
  updateSalon: (salon: Salon) => void;
  addAppointment: (salonId: string, appointment: Appointment) => void;
  createSalon: (name: string, plan: PlanType) => void;
}
