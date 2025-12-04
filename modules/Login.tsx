
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button, Card, Input } from '../components/UI';
import { Scissors, Lock, LogIn, ShieldCheck, User } from 'lucide-react';

export const Login: React.FC<{ 
  context: 'admin' | 'tenant';
  salonId?: string;
  onLogin: (salonId?: string, isProfessional?: boolean, professionalId?: string) => void;
  onBack: () => void;
}> = ({ context, salonId, onLogin, onBack }) => {
  const { salons } = useStore();
  const [password, setPassword] = useState('');
  
  // Professional Login State
  const [userType, setUserType] = useState<'owner' | 'professional'>('owner');
  const [selectedProId, setSelectedProId] = useState('');

  const salon = salonId ? salons.find(s => s.id === salonId) : null;

  const handleLogin = () => {
    if (context === 'tenant' && salonId) {
        if (userType === 'professional') {
             if (selectedProId && password) {
                 // Simple mock auth check (in real app check hash)
                 const pro = salon?.professionals.find(p => p.id === selectedProId);
                 if (pro && pro.password === password) {
                     onLogin(salonId, true, selectedProId);
                 } else {
                     alert('Senha incorreta ou profissional inválido');
                 }
             }
        } else {
            // Owner Login
            onLogin(salonId, false);
        }
    } else {
        onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center cursor-pointer" onClick={onBack}>
            <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-200">
                <Scissors className="w-8 h-8 text-white" />
            </div>
        </div>
        
        {context === 'admin' ? (
             <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
              Administração SaaS
            </h2>
        ) : (
            <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
               Área Restrita
            </h2>
        )}
        
        <p className="mt-2 text-center text-sm text-gray-600">
          <button onClick={onBack} className="font-medium text-brand-600 hover:text-brand-500">Voltar para Início</button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow-xl shadow-gray-200/50 border-0 sm:rounded-lg sm:px-10">
          
          <div className="space-y-6">
            {context === 'tenant' && salon ? (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mb-4 overflow-hidden border-4 border-white shadow-md">
                      {salon.coverImage ? (
                          <img src={salon.coverImage} className="w-full h-full object-cover" alt={salon.name} />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300">{salon.name[0]}</div>
                      )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">{salon.name}</h3>
                  
                  <div className="flex bg-gray-100 p-1 rounded-lg w-full mb-4">
                      <button 
                        className={`flex-1 py-1 text-sm font-bold rounded-md transition-colors ${userType === 'owner' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                        onClick={() => setUserType('owner')}
                      >
                          Sou Proprietário
                      </button>
                      <button 
                        className={`flex-1 py-1 text-sm font-bold rounded-md transition-colors ${userType === 'professional' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                        onClick={() => setUserType('professional')}
                      >
                          Sou Profissional
                      </button>
                  </div>

                  <div className="w-full space-y-3">
                    {userType === 'professional' && (
                        <select 
                            className="w-full px-3 py-2 border rounded-md"
                            value={selectedProId}
                            onChange={(e) => setSelectedProId(e.target.value)}
                        >
                            <option value="">Selecione seu nome...</option>
                            {salon.professionals.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    )}
                    <Input 
                        label="Senha" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-center"
                    />
                  </div>
               </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-2">
                             <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Super Admin</span>
                    </div>
                    <Input label="Email" placeholder="admin@salaoonline.com.br" />
                    <Input label="Senha" type="password" placeholder="••••••••" />
                </div>
            )}

            <Button 
                className="w-full flex justify-center items-center gap-2 py-3" 
                onClick={handleLogin}
            >
                <LogIn className="w-4 h-4" />
                {context === 'tenant' ? (userType === 'professional' ? 'Acessar Agenda' : 'Entrar no Painel') : 'Acessar Sistema'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
