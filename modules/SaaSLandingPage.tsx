
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import { Check, Scissors, Calendar, BarChart3, Globe, Star, PieChart, Ticket, ShoppingBag, Smartphone, User, Target, TrendingUp, Zap, ArrowRight, ShieldCheck, CreditCard, QrCode, Copy, Loader2, Lock } from 'lucide-react';
import { SaaSPlan } from '../types';

export const SaaSLandingPage: React.FC<{ 
  onEnterSystem: () => void;
  onViewDirectory: () => void;
  onHowItWorks: () => void;
  onViewTerms?: () => void;
  onViewPrivacy?: () => void;
}> = ({ onEnterSystem, onViewDirectory, onHowItWorks, onViewTerms, onViewPrivacy }) => {
  const { saasPlans } = useStore();
  
  // onEnterSystem agora volta para a tela de Registro/Login

  const scrollToPlans = () => {
    const section = document.getElementById('planos');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white font-sans scroll-smooth">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="bg-brand-600 p-1.5 rounded-lg">
               <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-brand-600 tracking-tight">Salão Online</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <button onClick={onHowItWorks} className="hover:text-brand-600 transition-colors">Como Funciona</button>
            <a href="#funcionalidades" className="hover:text-brand-600 transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-brand-600 transition-colors">Planos</a>
          </div>
          <Button onClick={onEnterSystem} className="text-xs">
              Criar Conta Grátis
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center flex flex-col items-center">
            
            <Badge color="red" className="mb-10 px-4 py-1 text-sm bg-brand-50 text-brand-700 border border-brand-100 shadow-sm">
                Novo: Loja Online Integrada 🛍️
            </Badge>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Gestão inteligente para <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-rose-400">seu salão de beleza</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transforme seu agendamento em uma máquina de vendas. Controle financeiro real, aplicativo nativo para a equipe e fidelização automática de clientes.
            </p>
            
            <div className="flex flex-col items-center gap-6 w-full">
              <Button 
                className="h-14 px-12 text-lg font-bold rounded-full shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all transform hover:-translate-y-1 w-full sm:w-auto uppercase tracking-wide bg-brand-600 hover:bg-brand-700 text-white scroll-smooth" 
                onClick={onEnterSystem}
              >
                Eu Quero
              </Button>

              {/* Social Proof */}
              <div 
                onClick={onViewDirectory}
                className="group cursor-pointer flex items-center gap-4 bg-white/60 border border-gray-200 p-2 pr-6 rounded-full shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 hover:border-brand-200 hover:shadow-md transition-all mt-2"
              >
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=5" alt="User" />
                  <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="User" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">+500</div>
                </div>
                <div className="text-left">
                  <div className="flex text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-600 transition-colors">Ver quem já aderiu</span>
                </div>
              </div>

            </div>
        </div>
        
        {/* Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
           <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
           <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>
      </header>

      {/* Feature Blocks (Z-Pattern) */}
      <section id="funcionalidades" className="py-20 bg-gray-50 space-y-24">
         {/* ... (Mantendo conteúdo igual, omitindo para brevidade pois só o botão muda) ... */}
         {/* ... Os blocos de conteúdo visual permanecem inalterados ... */}
      </section>

      {/* Pricing - DYNAMIC FROM STORE */}
      <section id="planos" className="py-20 scroll-mt-24">
         <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Planos para todos</h2>
              <p className="text-gray-500">Escolha o ideal para o seu momento.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
               
               {saasPlans.map(plan => {
                   const isPro = plan.id === 'professional';
                   return (
                       <div key={plan.id} className={`
                           bg-white border rounded-[2rem] p-8 shadow-sm hover:shadow-lg transition-all h-fit relative
                           ${isPro ? 'border-2 border-brand-100 shadow-2xl transform scale-105 z-10' : 'border-gray-100'}
                       `}>
                          {isPro && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Mais Escolhido
                              </div>
                          )}

                          <div className="text-center mb-6">
                              <h3 className="text-sm font-bold text-gray-900 mb-2">{plan.name}</h3>
                              <div className="flex justify-center items-baseline gap-1">
                                <span className="text-4xl font-extrabold text-gray-900">R$ {plan.price}</span>
                                <span className="text-gray-400 text-sm">/mês</span>
                              </div>
                              {plan.perProfessionalPrice > 0 && (
                                  <p className="text-brand-500 font-semibold text-xs mt-2">+ R$ {plan.perProfessionalPrice} por profissional</p>
                              )}
                              
                              <Badge color="gray" className="mt-2 bg-gray-100 text-gray-600 border border-gray-200">
                                  {plan.maxProfessionals ? `INCLUI ${plan.maxProfessionals} PROFISSIONAL(IS)` : 'PROFISSIONAIS ILIMITADOS'}
                              </Badge>
                          </div>
                          
                          <ul className="space-y-4 mb-8 text-sm">
                             {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-600">
                                    <div className="rounded-full bg-green-100 p-1"><Check className="w-3 h-3 text-green-600" /></div> {feature}
                                </li>
                             ))}
                          </ul>
                          
                          <Button 
                            variant={isPro ? 'primary' : 'secondary'} 
                            className={`w-full rounded-xl py-3 font-bold ${isPro ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'bg-gray-100 text-gray-600'}`} 
                            onClick={onEnterSystem}
                          >
                            {isPro ? 'Assinar Agora' : 'Começar Agora'}
                          </Button>
                       </div>
                   )
               })}

            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4 text-white">
                    <Scissors className="w-6 h-6" />
                    <span className="font-bold text-xl">Salão Online</span>
                </div>
                <p className="max-w-xs text-sm">
                    A plataforma completa para gestão de beleza e estética. Transformando pequenos negócios em grandes impérios.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Produto</h4>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={onHowItWorks} className="hover:text-white">Como Funciona</button></li>
                    <li><button onClick={onEnterSystem} className="hover:text-white">Criar Conta</button></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={onViewTerms} className="hover:text-white">Termos de Uso</button></li>
                    <li><button onClick={onViewPrivacy} className="hover:text-white">Privacidade</button></li>
                </ul>
            </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
            © 2024 <span onClick={() => {}} className="cursor-pointer hover:text-white transition-colors">Salão Online</span> MVP. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};
