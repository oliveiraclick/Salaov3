import React, { useState } from 'react';
import { useStore } from '../store';
import { Button, Card, Input, Badge } from '../components/UI';
import { LayoutDashboard, Users, Plus, Trash2, ExternalLink, LogOut } from 'lucide-react';
import { Salon } from '../types';

export const SuperAdmin: React.FC<{ 
  onNavigate: (view: 'tenant' | 'public', salonId: string) => void,
  onLogout: () => void 
}> = ({ onNavigate, onLogout }) => {
  const { salons, createSalon, updateSalon } = useStore();
  const [newSalonName, setNewSalonName] = useState('');

  const handleCreate = () => {
    if (!newSalonName) return;
    createSalon(newSalonName, 'start');
    setNewSalonName('');
  };

  const togglePlan = (salon: Salon) => {
    updateSalon({
      ...salon,
      plan: salon.plan === 'start' ? 'professional' : 'start'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-brand-600" />
              SaaS Super Admin
            </h1>
            <p className="text-gray-500">Gestão global de assinantes e planos</p>
          </div>
          <div className="flex gap-2 items-center">
             <Button variant="outline" className="mr-4 text-red-600 hover:bg-red-50 border-red-200" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2 inline" />
                Sair
             </Button>
             <div className="flex">
                <Input 
                   placeholder="Nome do novo salão..." 
                   value={newSalonName} 
                   onChange={(e) => setNewSalonName(e.target.value)}
                   className="rounded-r-none border-r-0 mb-0 w-64"
                />
                <Button onClick={handleCreate} className="rounded-l-none h-[42px] mt-[1px]">
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Criar Salão
                </Button>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-4 border-l-brand-500">
                <div className="text-sm text-gray-500">Total de Salões</div>
                <div className="text-3xl font-bold text-gray-800">{salons.length}</div>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
                <div className="text-sm text-gray-500">Plano Profissional</div>
                <div className="text-3xl font-bold text-gray-800">{salons.filter(s => s.plan === 'professional').length}</div>
            </Card>
            <Card className="border-l-4 border-l-green-500">
                <div className="text-sm text-gray-500">Receita Estimada (Mensal)</div>
                <div className="text-3xl font-bold text-gray-800">
                    R$ {salons.reduce((acc, s) => acc + (s.plan === 'professional' ? 199 : 49), 0)}
                </div>
            </Card>
        </div>

        <Card title="Lista de Clientes (Salões)">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano Atual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salons.map(salon => (
                  <tr key={salon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold">
                          {salon.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{salon.name}</div>
                          <div className="text-sm text-gray-500">/{salon.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer select-none ${
                        salon.plan === 'professional' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => togglePlan(salon)}
                      title="Clique para alternar o plano"
                      >
                        {salon.plan === 'professional' ? 'PROFESSIONAL' : 'START'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge color="green">Ativo</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                      <Button variant="outline" className="text-xs py-1" onClick={() => onNavigate('tenant', salon.id)}>
                        <LayoutDashboard className="w-3 h-3 mr-1 inline" />
                        Acessar Painel
                      </Button>
                      <Button variant="secondary" className="text-xs py-1" onClick={() => onNavigate('public', salon.id)}>
                        <ExternalLink className="w-3 h-3 mr-1 inline" />
                        Ver Vitrine
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
