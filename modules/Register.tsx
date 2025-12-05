
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button } from '../components/UI';
import { CalendarCheck, ArrowRight, User, Mail, Phone, Lock, Store, MapPin } from 'lucide-react';

export const Register: React.FC<{ 
  onLoginRedirect: () => void;
  onSuccess: (email: string) => void; 
}> = ({ onLoginRedirect, onSuccess }) => {
  const { createSalon } = useStore();
  
  const [formData, setFormData] = useState({
    ownerName: '',
    salonName: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!formData.ownerName || !formData.salonName || !formData.email || !formData.password || !formData.address) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    setIsLoading(true);

    setTimeout(() => {
        // Create the salon with password and address
        createSalon(
            formData.salonName, 
            'professional', 
            formData.address,
            formData.ownerName,
            formData.email,
            formData.password
        );
        
        setTimeout(() => {
            // Instead of ID, we pass the email to pre-fill the login
            onSuccess(formData.email);
            setIsLoading(false);
        }, 500);
    }, 1500);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md my-auto">
        <div className="flex justify-center mb-6">
            {/* Removed shadow-xl shadow-brand-500/20 */}
            <div className="bg-brand-600 p-3 rounded-2xl animate-in zoom-in duration-500">
                <CalendarCheck className="w-10 h-10 text-white" />
            </div>
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Crie sua conta grátis
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
            Já tem uma conta? <button onClick={onLoginRedirect} className="font-bold text-brand-600 hover:text-brand-800 transition-colors">Fazer Login</button>
        </p>

        <div className="mt-8 bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Seu Nome</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="João Silva"
                                value={formData.ownerName}
                                onChange={e => setFormData({...formData, ownerName: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Nome do Estabelecimento</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                placeholder="Nome da empresa..."
                                value={formData.salonName}
                                onChange={e => setFormData({...formData, salonName: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Endereço Completo</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            placeholder="Rua Exemplo, 123 - Centro, Cidade"
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">E-mail Profissional</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            type="email" 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            placeholder="contato@suaempresa.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">WhatsApp / Celular</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            type="tel" 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            placeholder="(11) 99999-9999"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Crie uma Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button 
                        className="w-full py-3.5 text-lg font-bold rounded-xl shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Criando...' : 'Continuar'} <ArrowRight className="w-5 h-5" />
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Ao continuar, você concorda com nossos <span className="underline cursor-pointer">Termos de Uso</span>.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
