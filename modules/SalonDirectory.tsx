import React, { useState } from 'react';
import { useStore } from '../store';
import { Badge, AppShell, MobileNav, MobileNavItem } from '../components/UI';
import { Search, MapPin, Star, ArrowRight, Home, User } from 'lucide-react';

export const SalonDirectory: React.FC<{ 
  onSelectSalon: (salonId: string) => void;
  onBack: () => void;
  onAdminAccess: (salonId: string) => void; 
}> = ({ onSelectSalon, onBack, onAdminAccess }) => {
  const { salons } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Barbearia', 'Salão', 'Manicure', 'Spa', 'Automotivo'];

  const getCategory = (name: string) => {
    if (name.toLowerCase().includes('barber') || name.toLowerCase().includes('barbearia')) return 'Barbearia';
    if (name.toLowerCase().includes('studio') || name.toLowerCase().includes('beleza')) return 'Salão';
    if (name.toLowerCase().includes('lava') || name.toLowerCase().includes('automotivo')) return 'Automotivo';
    return 'Salão';
  };

  const filteredSalons = salons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          salon.services.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeFilter === 'Todos' || getCategory(salon.name) === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const Header = (
      <div className="px-4 py-2 bg-white">
        <div className="font-bold text-lg text-brand-600 uppercase tracking-tight mb-2 pt-2">Agende +</div>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
                type="text"
                className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Buscar local ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        {/* Filters Inline Scroll */}
        <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar -mx-4 px-4">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`
                        px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0
                        ${activeFilter === filter 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-white text-gray-600 border border-gray-200'}
                    `}
                >
                    {filter}
                </button>
            ))}
        </div>
      </div>
  );

  return (
    <AppShell
        header={Header}
        bottomNav={
            <MobileNav>
                <MobileNavItem icon={<Home />} label="Início" active={true} onClick={() => {}} />
                <MobileNavItem icon={<Star />} label="Favoritos" onClick={() => {}} />
                <MobileNavItem icon={<User />} label="Perfil/Login" onClick={onBack} />
            </MobileNav>
        }
    >
        <div className="p-4 space-y-4">
            {filteredSalons.length === 0 && (
                <div className="text-center py-10 text-gray-500">Nenhum estabelecimento encontrado.</div>
            )}

            {filteredSalons.map(salon => (
                <div 
                    key={salon.id}
                    onClick={() => onSelectSalon(salon.id)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform relative group"
                >
                    <div className="h-32 bg-gray-200 relative">
                        <img 
                            src={salon.coverImage || `https://picsum.photos/seed/${salon.id}/400/200`} 
                            className="w-full h-full object-cover" 
                            alt={salon.name}
                        />
                         <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-gray-800 uppercase">
                            {salon.category || 'Estabelecimento'}
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{salon.name}</h3>
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-bold">4.8</span>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs mb-3">
                            <MapPin className="w-3 h-3 mr-1" /> 
                            <span className="truncate">{salon.address || 'Centro, SP'}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                             <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded">Aberto Agora</div>
                             <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </AppShell>
  );
};