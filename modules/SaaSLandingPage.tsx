
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button, Card, Badge, Modal, Input } from '../components/UI';
import { Check, Scissors, Calendar, BarChart3, Globe, Star, PieChart, Ticket, ShoppingBag, Smartphone, User, Target, TrendingUp, Zap, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { SaaSPlan } from '../types';

export const SaaSLandingPage: React.FC<{ 
  onEnterSystem: () => void;
  onViewDirectory: () => void;
  onHowItWorks: () => void;
  onViewTerms?: () => void;
  onViewPrivacy?: () => void;
}> = ({ onEnterSystem, onViewDirectory, onHowItWorks, onViewTerms, onViewPrivacy }) => {
  const { saasPlans, coupons, createSalon } = useStore();
  
  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SaaSPlan | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ name: '', salonName: '' });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const handleOpenCheckout = (plan: SaaSPlan) => {
      setSelectedPlan(plan);
      setDiscount(0);
      setCouponCode('');
      setIsCheckoutOpen(true);
  };

  const checkCoupon = () => {
      const coupon = coupons.find(c => c.code === couponCode.toUpperCase() && c.active);
      if (coupon) {
          setDiscount(coupon.discountPercent);
      } else {
          setDiscount(0);
          alert('Cupom inválido');
      }
  };

  const handleFinishCheckout = () => {
      if (!selectedPlan || !checkoutForm.salonName) return;
      createSalon(checkoutForm.salonName, selectedPlan.id, discount > 0 ? couponCode.toUpperCase() : undefined);
      setIsCheckoutOpen(false);
      onEnterSystem(); // Go to Login
  };
  
  const scrollToPlans = () => {
    const section = document.getElementById('planos');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const finalPrice = selectedPlan ? selectedPlan.price * (1 - discount / 100) : 0;

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
                onClick={scrollToPlans}
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

              {/* App Store Badges */}
              <div className="flex gap-4 items-center justify-center opacity-80 hover:opacity-100 transition-opacity mt-4">
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.3414C17.5178 15.3282 15.657 13.2505 15.657 10.7416C15.657 8.35649 17.3734 7.02536 17.4705 6.96541C16.4802 5.56453 14.9458 5.33306 14.4172 5.30907C13.0645 5.17116 11.7779 6.09503 11.0963 6.09503C10.4147 6.09503 9.32488 5.30127 8.19692 5.32525C6.73693 5.34563 5.39343 6.16639 4.64654 7.45299C3.12061 10.0818 4.25893 14.0041 5.75133 16.1557C6.48169 17.2081 7.33924 18.3541 8.48962 18.3121C9.60107 18.2702 10.0246 17.6045 11.3781 17.6045C12.7234 17.6045 13.0974 18.3121 14.2697 18.2917C15.4851 18.2702 16.2415 17.1866 16.9634 16.1341C17.5113 15.333 17.7607 14.9442 18.0197 14.4697C17.9897 14.4565 17.523 15.3414 17.523 15.3414ZM12.9861 3.58552C13.6062 2.83648 14.0205 1.79603 13.9065 0.751465C13.0118 0.787445 11.9303 1.34842 11.2847 2.09904C10.6923 2.78491 10.176 3.84338 10.2983 4.88075C11.2989 4.95751 12.3683 4.33153 12.9861 3.58552Z" /></svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase leading-none">Download on the</div>
                    <div className="text-sm font-bold leading-none">App Store</div>
                  </div>
                </button>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186C3.21 21.969 3 21.468 3 21.056V2.944C3 2.532 3.21 2.031 3.609 1.814ZM14.618 12.825L17.729 15.936L14.618 12.826ZM14.618 11.174L17.729 8.064L14.618 11.174ZM15.444 12L19.262 8.182C19.722 8.437 20.25 9.143 20.25 10.056V13.944C20.25 14.857 19.722 15.563 19.262 15.818L15.444 12Z" /></svg>
                  <div className="text-left">
                    <div className="text-[10px] uppercase leading-none">Get it on</div>
                    <div className="text-sm font-bold leading-none">Google Play</div>
                  </div>
                </button>
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
        
        {/* Block 1: Sales / E-commerce */}
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-200 to-transparent rounded-full filter blur-2xl opacity-50"></div>
                <Card className="relative p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500 border-t-4 border-t-brand-500 shadow-xl">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-800">Seu Carrinho</span>
                        <ShoppingBag className="w-5 h-5 text-brand-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Corte de Cabelo</span>
                            <span className="font-bold">R$ 60,00</span>
                        </div>
                        <div className="flex justify-between items-center text-sm bg-green-50 p-2 rounded-lg border border-green-100">
                            <div className="flex items-center gap-2">
                                <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=50" className="w-8 h-8 rounded object-cover" />
                                <div>
                                    <div className="font-bold text-gray-800">Pomada Modeladora</div>
                                    <div className="text-[10px] text-green-600 font-bold">Adicionado Agora!</div>
                                </div>
                            </div>
                            <span className="font-bold text-green-700">+ R$ 45,00</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-dashed border-gray-200">
                            <span>Total</span>
                            <span className="text-brand-600">R$ 105,00</span>
                        </div>
                        <Button className="w-full text-sm">Finalizar Agendamento</Button>
                    </div>
                </Card>
            </div>
            <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold text-xs uppercase mb-4">
                    <Zap className="w-4 h-4" /> Aumente seu Ticket Médio
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                    Não venda apenas horas. <br/> 
                    <span className="text-brand-600">Venda produtos.</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Transforme seu agendamento em um E-commerce. O sistema oferece pomadas, shampoos e kits automaticamente enquanto seu cliente agenda o horário.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-1" />
                        <span className="text-gray-700">Upsell automático no checkout.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-1" />
                        <span className="text-gray-700">Controle de estoque integrado com baixa automática.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-1" />
                        <span className="text-gray-700">Comissão de venda para seus profissionais.</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* Block 2: Management / BI */}
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
             <div className="order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs uppercase mb-4">
                    <Target className="w-4 h-4" /> Inteligência de Negócio
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                    Deixe de ser dono. <br/> 
                    <span className="text-blue-600">Vire empresário.</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Chega de "achar" que o mês foi bom. Tenha certeza. Defina metas de faturamento, monitore sua margem de lucro real e saiba exatamente quem são seus melhores clientes.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900 mb-1">R$ 15k</div>
                        <div className="text-xs text-gray-500">Meta do Mês</div>
                        <div className="w-full bg-gray-100 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[80%]"></div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="text-2xl font-bold text-gray-900 mb-1">32%</div>
                        <div className="text-xs text-gray-500">Margem de Lucro</div>
                        <div className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Subindo
                        </div>
                    </div>
                </div>
            </div>
            <div className="order-2 relative">
                 {/* Visual Representation of Dashboard */}
                 <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 rotate-1 hover:rotate-0 transition-transform duration-500">
                     <div className="flex justify-between items-center mb-6">
                         <div className="font-bold text-lg">Dashboard Executivo</div>
                         <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-400"></div>
                             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                             <div className="w-3 h-3 rounded-full bg-green-400"></div>
                         </div>
                     </div>
                     <div className="space-y-4">
                         <div className="h-32 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-end justify-around p-4 pb-0">
                             <div className="w-8 bg-brand-200 h-[40%] rounded-t"></div>
                             <div className="w-8 bg-brand-300 h-[60%] rounded-t"></div>
                             <div className="w-8 bg-brand-500 h-[80%] rounded-t"></div>
                             <div className="w-8 bg-brand-600 h-[50%] rounded-t"></div>
                             <div className="w-8 bg-gray-300 h-[30%] rounded-t"></div>
                         </div>
                         <div className="flex gap-4">
                             <div className="flex-1 bg-red-50 p-3 rounded-lg border border-red-100">
                                 <div className="text-xs text-red-600 font-bold mb-1">Clientes Perdidos</div>
                                 <div className="text-xl font-bold text-gray-800">12</div>
                             </div>
                             <div className="flex-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                 <div className="text-xs text-blue-600 font-bold mb-1">Novos</div>
                                 <div className="text-xl font-bold text-gray-800">45</div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>

        {/* Block 3: Team / Pro Panel */}
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
                <Card className="p-0 overflow-hidden shadow-2xl border-0 bg-gray-900 text-white transform -rotate-1 hover:rotate-0 transition-transform">
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-green-500"></div>
                            <div>
                                <div className="font-bold">João Barbeiro</div>
                                <div className="text-xs text-gray-400">Online</div>
                            </div>
                        </div>
                        <Badge color="green">R$ 2.450,00</Badge>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                             <div className="text-xs text-gray-400 uppercase mb-2">Sua Agenda Hoje</div>
                             <div className="space-y-2">
                                 <div className="flex justify-between text-sm"><span>09:00 - Corte</span> <span className="text-green-400">R$ 30,00</span></div>
                                 <div className="flex justify-between text-sm"><span>10:00 - Barba</span> <span className="text-green-400">R$ 20,00</span></div>
                                 <div className="flex justify-between text-sm opacity-50"><span>11:00 - Livre</span> <span>--</span></div>
                             </div>
                        </div>
                        <Button className="w-full bg-brand-600 hover:bg-brand-500 border-0">Ver Meu Financeiro</Button>
                    </div>
                </Card>
            </div>
            <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs uppercase mb-4">
                    <User className="w-4 h-4" /> Retenção de Talentos
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                    Sua equipe <br/> 
                    <span className="text-purple-600">vestindo a camisa.</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Dê autonomia para seus profissionais. Cada barbeiro tem seu próprio app, QR Code para divulgação e, o mais importante: <b>controle financeiro pessoal</b> integrado.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-1" />
                        <span className="text-gray-700">Link direto para agendar com o profissional.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-1" />
                        <span className="text-gray-700">Calculadora de comissões em tempo real.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-1" />
                        <span className="text-gray-700">Eles crescem, você cresce.</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* Block 4: Native App Tech */}
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
             <div className="order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-bold text-xs uppercase mb-4">
                    <Smartphone className="w-4 h-4" /> Tecnologia de Ponta
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                    Experiência de <br/> 
                    <span className="text-gray-900 bg-brand-200 px-2 rounded transform -rotate-1 inline-block">App Nativo</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Esqueça sites lentos que parecem dos anos 2000. Entregamos uma experiência fluida, sem carregamentos chatos. Um aplicativo real instalado no celular do seu cliente e da sua equipe.
                </p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-gray-800">Zero Delay</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="font-bold text-gray-800">Seguro</span>
                    </div>
                </div>
            </div>
            <div className="order-2 flex justify-center">
                 <div className="relative w-64 h-[500px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden">
                     {/* Screen Mockup */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-xl z-20"></div>
                     <div className="h-full bg-gray-50 flex flex-col pt-8">
                         <div className="px-4 mb-4">
                             <div className="w-12 h-12 bg-brand-100 rounded-full mb-2"></div>
                             <div className="h-4 bg-gray-200 w-3/4 rounded mb-1"></div>
                             <div className="h-3 bg-gray-100 w-1/2 rounded"></div>
                         </div>
                         <div className="flex-1 bg-white rounded-t-3xl p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                             <div className="flex gap-2 overflow-hidden mb-4">
                                 <div className="w-24 h-32 bg-gray-100 rounded-xl flex-shrink-0"></div>
                                 <div className="w-24 h-32 bg-gray-100 rounded-xl flex-shrink-0"></div>
                             </div>
                             <div className="space-y-2">
                                 <div className="h-12 bg-brand-50 rounded-xl w-full"></div>
                                 <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
                                 <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
                             </div>
                         </div>
                         {/* Bottom Nav Mockup */}
                         <div className="h-16 bg-white border-t border-gray-100 flex justify-around items-center px-2">
                             <div className="w-8 h-8 rounded bg-brand-100"></div>
                             <div className="w-8 h-8 rounded bg-gray-100"></div>
                             <div className="w-8 h-8 rounded bg-gray-100"></div>
                         </div>
                     </div>
                 </div>
            </div>
        </div>

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
                            onClick={() => handleOpenCheckout(plan)}
                          >
                            {isPro ? 'Assinar Agora' : 'Começar Agora'}
                          </Button>
                       </div>
                   )
               })}

            </div>
         </div>
      </section>
      
      {/* Checkout Modal */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title={`Assinar Plano ${selectedPlan?.name}`}>
          <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                  <div>
                      <div className="text-sm font-bold text-gray-900">Mensalidade</div>
                      {discount > 0 && <div className="text-xs text-green-600">Cupom Aplicado ({discount}%)</div>}
                  </div>
                  <div className="text-right">
                      {discount > 0 && <div className="text-xs text-gray-400 line-through">R$ {selectedPlan?.price}</div>}
                      <div className="font-bold text-lg text-brand-600">R$ {finalPrice.toFixed(2)}</div>
                  </div>
              </div>
              
              <div className="space-y-3">
                  <Input 
                    label="Seu Nome" 
                    placeholder="João Silva" 
                    value={checkoutForm.name} 
                    onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} 
                  />
                  <Input 
                    label="Nome do Salão" 
                    placeholder="Barbearia Silva" 
                    value={checkoutForm.salonName} 
                    onChange={e => setCheckoutForm({...checkoutForm, salonName: e.target.value})} 
                  />
                  
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cupom de Desconto</label>
                      <div className="flex gap-2">
                          <Input 
                            className="mb-0" 
                            placeholder="PROMO10" 
                            value={couponCode} 
                            onChange={e => setCouponCode(e.target.value)} 
                          />
                          <Button variant="secondary" onClick={checkCoupon} className="mb-0"><Ticket className="w-4 h-4" /></Button>
                      </div>
                  </div>
              </div>
              
              <Button className="w-full mt-4" onClick={handleFinishCheckout} disabled={!checkoutForm.salonName}>
                  Finalizar e Acessar
              </Button>
          </div>
      </Modal>

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
                    <li><a href="#" className="hover:text-white">Funcionalidades</a></li>
                    <li><a href="#" className="hover:text-white">Planos</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                    <li><button onClick={onViewTerms} className="hover:text-white">Termos de Uso</button></li>
                    <li><button onClick={onViewPrivacy} className="hover:text-white">Privacidade</button></li>
                    <li><a href="#" className="hover:text-white">Contato</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
            © 2024 <span onClick={onEnterSystem} className="cursor-pointer hover:text-white transition-colors">Salão Online</span> MVP. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};
