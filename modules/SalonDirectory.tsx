import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Badge, Button } from '../components/UI';
import { Search, MapPin, Star, Filter, ArrowRight } from 'lucide-react';

export const SalonDirectory: React.FC<{ 
  onSelectSalon: (salonId: string) => void;
  onBack: () => void; 
}> = ({ onSelectSalon, onBack }) => {
  const { salons } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Barbearia', 'Salão', 'Manicure', 'Spa'];

  // Mocking some extra data for the directory view since the store is simple
  const getCategory = (name: string) => {
    if (name.toLowerCase().includes('barber') || name.toLowerCase().includes('barbearia')) return 'Barbearia';
    if (name.toLowerCase().includes('studio') || name.toLowerCase().includes('beleza')) return 'Salão';
    return 'Salão';
  };

  const filteredSalons = salons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          salon.services.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeFilter === 'Todos' || getCategory(salon.name) === activeFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div 
              className="font-bold text-xl text-brand-600 tracking-tight cursor-pointer uppercase"
              onClick={onBack}
            >
              Salão Online
            </div>
            <div className="text-sm text-gray-500">
                Encontre os melhores profissionais
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Search Bar */}
        <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-lg shadow-sm"
                placeholder="Buscar salão ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
            {filters.map(filter => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`
                        px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors
                        ${activeFilter === filter 
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}
                    `}
                >
                    {filter}
                </button>
            ))}
        </div>

        {/* Featured Section (Mocked logic: First professional plan salon) */}
        {activeFilter === 'Todos' && !searchTerm && (
            <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Em Destaque</h2>
                {salons.filter(s => s.plan === 'professional').slice(0, 1).map(featured => (
                    <div 
                        key={featured.id}
                        onClick={() => onSelectSalon(featured.id)}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-start"
                    >
                        <div className="w-full md:w-48 h-32 bg-gray-200 rounded-xl overflow-hidden relative">
                             <img src={`https://picsum.photos/seed/${featured.id}/400/300`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt={featured.name} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge color="green">SALÃO PARCEIRO</Badge>
                                <span className="flex items-center text-yellow-500 text-sm font-bold gap-1">
                                    <Star className="w-3 h-3 fill-current" /> 5.0
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{featured.name}</h3>
                            <div className="flex items-center text-gray-500 text-sm mb-4">
                                <MapPin className="w-4 h-4 mr-1" /> {featured.address || 'São Paulo, SP'}
                            </div>
                            <p className="text-gray-600 line-clamp-2 mb-4 text-sm">{featured.description}</p>
                            <div className="flex gap-2">
                                {featured.services.slice(0, 3).map(s => (
                                    <span key={s.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* List */}
        <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-900">
                {filteredSalons.length} Resultados
             </h2>
             <span className="text-sm text-brand-600 font-medium cursor-pointer hover:underline">Ver no mapa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map(salon => (
                <div 
                    key={salon.id}
                    onClick={() => onSelectSalon(salon.id)}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all cursor-pointer flex flex-col"
                >
                    <div className="h-40 bg-gray-100 relative overflow-hidden">
                        <img 
                            src={`https://picsum.photos/seed/${salon.id}/400/200`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            alt={salon.name}
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-green-700 flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Aberto agora
                        </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-brand-600 transition-colors">
                                    {salon.name}
                                </h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-0.5">
                                    {getCategory(salon.name)}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-bold text-yellow-700">4.8</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                            <MapPin className="w-3 h-3 mr-1" /> 
                            <span className="truncate">{salon.address || 'Centro, SP'}</span>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-xs text-gray-400">Próximo horário: 14:00</span>
                            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {filteredSalons.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500">
                    Nenhum salão encontrado com esses filtros.
                </div>
            )}
        </div>
        
        {/* Banner CTA */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-center text-white relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">É dono de um salão?</h3>
                <p className="text-gray-300 mb-6">Cadastre seu negócio gratuitamente e apareça para milhares de clientes.</p>
                <Button className="bg-white text-gray-900 hover:bg-gray-100 border-none" onClick={onBack}>
                    Cadastrar Meu Salão
                </Button>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

      </main>
    </div>
  );
};