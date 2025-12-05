import React from 'react';
import { Button } from '../components/UI';
import { 
  LayoutDashboard, CalendarCheck, Calendar, User, 
  ShoppingBag, TrendingUp, ShieldCheck, QrCode, 
  MessageCircle, ChevronLeft, ArrowRight, Smartphone,
  Wallet, Target, Package
} from 'lucide-react';

export const HowItWorks: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans pb-20">
      {/* Header Sticky */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="text-xs flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <div className="bg-brand-600 p-1.5 rounded-lg">
               <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Agende +</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-brand-600 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Como Funciona?</h1>
        <p className="text-brand-100 max-w-xl mx-auto text-lg">
          O ecossistema completo para conectar empresas de serviços, profissionais e clientes em uma única plataforma.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-12">
        
        {/* Módulo 1: Gestão da Empresa */}
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <LayoutDashboard className="w-48 h-48 text-brand-600" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">1. Gestão da Empresa</h2>
                            <p className="text-gray-500 text-sm">O Painel Administrativo do Negócio</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-gray-600 leading-relaxed">
                                O proprietário tem visão 360º do negócio. Ideal para Salões, Clínicas, Lava Rápidos e Pet Shops.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-green-100 p-1 rounded-full"><TrendingUp className="w-3 h-3 text-green-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Financeiro Completo</span>
                                        <span className="text-xs text-gray-500">Contas a pagar/receber, fluxo de caixa e cálculo automático de comissões.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-blue-100 p-1 rounded-full"><Package className="w-3 h-3 text-blue-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Controle de Estoque & Loja</span>
                                        <span className="text-xs text-gray-500">Gerencie produtos de uso interno e cadastre itens para venda online no agendamento.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-orange-100 p-1 rounded-full"><Target className="w-3 h-3 text-orange-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">CRM & Inteligência</span>
                                        <span className="text-xs text-gray-500">Alertas de aniversariantes, resgate de clientes inativos e metas de faturamento.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                                <span className="text-xs font-bold uppercase text-gray-400">Visão do Proprietário</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                </div>
                            </div>
                            <div className="space-y-2 opacity-75">
                                <div className="h-20 bg-white rounded border border-gray-200 w-full mb-2"></div>
                                <div className="flex gap-2">
                                    <div className="h-16 bg-white rounded border border-gray-200 flex-1"></div>
                                    <div className="h-16 bg-white rounded border border-gray-200 flex-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Módulo 2: Gestão do Profissional */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User className="w-48 h-48 text-blue-600" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <CalendarCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">2. Painel do Profissional</h2>
                            <p className="text-gray-500 text-sm">Autonomia para sua Equipe</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="order-2 md:order-1 bg-gray-50 rounded-xl p-4 border border-gray-200">
                             {/* Mockup Visual */}
                             <div className="flex flex-col items-center justify-center h-full space-y-3">
                                 <div className="bg-white p-3 rounded-lg shadow-sm w-3/4 flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                     <div className="h-2 bg-gray-200 w-20 rounded"></div>
                                 </div>
                                 <div className="bg-white p-3 rounded-lg shadow-sm w-3/4 flex justify-between">
                                     <div className="h-2 bg-gray-200 w-10 rounded"></div>
                                     <div className="h-2 bg-green-200 w-10 rounded"></div>
                                 </div>
                             </div>
                        </div>
                        <div className="order-1 md:order-2 space-y-4">
                            <p className="text-gray-600 leading-relaxed">
                                Cada colaborador tem seu próprio acesso. Eles gerenciam seu trabalho sem acessar os dados financeiros sensíveis da empresa.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-purple-100 p-1 rounded-full"><QrCode className="w-3 h-3 text-purple-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Link & QR Code Próprio</span>
                                        <span className="text-xs text-gray-500">O profissional divulga seu próprio link. O cliente agenda direto com ele, pulando etapas.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-green-100 p-1 rounded-full"><Wallet className="w-3 h-3 text-green-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Financeiro Pessoal & Comissões</span>
                                        <span className="text-xs text-gray-500">Acompanhe suas comissões e gerencie suas contas a pagar/receber pessoais em um único lugar.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-red-100 p-1 rounded-full"><Calendar className="w-3 h-3 text-red-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Gestão de Agenda</span>
                                        <span className="text-xs text-gray-500">Bloqueio de horários para almoço, folgas ou férias com apenas alguns cliques.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Módulo 3: Experiência do Cliente */}
        <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Smartphone className="w-48 h-48 text-green-600" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">3. Usabilidade do Cliente</h2>
                            <p className="text-gray-500 text-sm">Agendamento & E-commerce</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-gray-600 leading-relaxed">
                                Uma vitrine digital moderna que funciona como um aplicativo, sem precisar baixar nada.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-brand-100 p-1 rounded-full"><Smartphone className="w-3 h-3 text-brand-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Vitrine do Negócio</span>
                                        <span className="text-xs text-gray-500">Perfil completo com fotos, "Sobre Nós", localização e links diretos para redes sociais.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-yellow-100 p-1 rounded-full"><ShoppingBag className="w-3 h-3 text-yellow-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Loja Integrada (Upsell)</span>
                                        <span className="text-xs text-gray-500">Ao agendar um serviço, o cliente pode comprar um produto e pagar tudo junto.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-1 bg-blue-100 p-1 rounded-full"><MessageCircle className="w-3 h-3 text-blue-600" /></div>
                                    <div>
                                        <span className="font-bold text-gray-800 text-sm block">Identificação Rápida</span>
                                        <span className="text-xs text-gray-500">Sistema inteligente que reconhece o cliente pelo celular, sem senhas complexas.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gray-900 rounded-[2rem] p-4 border-4 border-gray-800 shadow-2xl w-full max-w-[200px] mx-auto relative">
                             {/* Mobile Mockup */}
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-800 rounded-b-xl"></div>
                             <div className="h-full bg-white rounded-[1.5rem] overflow-hidden flex flex-col">
                                 <div className="h-20 bg-gray-200 w-full"></div>
                                 <div className="p-2 space-y-2">
                                     <div className="h-2 bg-gray-100 w-1/2 rounded"></div>
                                     <div className="h-8 bg-brand-50 rounded w-full"></div>
                                     <div className="h-8 bg-gray-50 rounded w-full"></div>
                                     <div className="mt-auto bg-brand-600 h-8 rounded w-full"></div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="text-center pb-8 pt-4">
             <Button className="px-8 py-4 text-lg font-bold rounded-full shadow-lg shadow-brand-200" onClick={onBack}>
                 Começar Agora <ArrowRight className="w-5 h-5 ml-2" />
             </Button>
        </div>

      </div>
    </div>
  );
};