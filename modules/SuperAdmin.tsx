
import React, { useState } from 'react';
import { useStore } from '../store';
import { Button, Card, Input, Badge, AppShell, MobileNav, MobileNavItem } from '../components/UI';
import { LayoutDashboard, Users, Plus, LogOut, Tags, DollarSign, Pen, Ban, CheckCircle, TrendingUp, Target, PartyPopper } from 'lucide-react';
import { Salon, SaaSPlan } from '../types';

export const SuperAdmin: React.FC<{ 
  onNavigate: (view: 'tenant' | 'public', salonId: string) => void,
  onLogout: () => void 
}> = ({ onNavigate, onLogout }) => {
  const { salons, saasPlans, coupons, saasRevenueGoal, createSalon, updateSaaSPlan, createCoupon, toggleSalonStatus } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'plans' | 'coupons'>('dashboard');
  
  // Local states for forms
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('');
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);

  // Metrics
  const totalMRR = salons.reduce((acc, s) => acc + (s.subscriptionStatus === 'active' ? s.monthlyFee : 0), 0);
  const totalSalons = salons.length;
  const activeSalons = salons.filter(s => s.subscriptionStatus === 'active').length;
  const lateSalons = salons.filter(s => s.subscriptionStatus === 'late').length;
  
  // Progress
  const mrrProgress = Math.min((totalMRR / saasRevenueGoal) * 100, 100);

  // New Salons (Simulated current month)
  const newSalonsCount = salons.filter(s => {
      // For MVP, just treating all as recent if mock
      // In real, filter by createdAt
      return true; 
  }).length;

  const Header = (
      <div className="px-4 py-3 bg-gray-900 text-white flex justify-between items-center shadow-md">
          <div className="font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" /> Admin Financeiro
          </div>
          <button onClick={onLogout} className="text-xs text-gray-300 hover:text-white font-medium flex items-center gap-1">
              <LogOut className="w-3 h-3" /> Sair
          </button>
      </div>
  );

  const renderContent = () => {
      switch(activeTab) {
          case 'dashboard':
              return (
                  <div className="space-y-4">
                      {/* Strategic Goal Card */}
                      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0 relative overflow-visible">
                          <div className="flex justify-between items-end mb-2 relative z-10">
                              <div>
                                  <div className="flex items-center gap-2 text-gray-400 text-xs uppercase font-bold mb-1">
                                      <Target className="w-4 h-4 text-green-400" /> Meta MRR
                                  </div>
                                  <div className="text-3xl font-bold">R$ {totalMRR.toFixed(2)}</div>
                              </div>
                              <div className="text-right">
                                  <div className="text-xs text-gray-400">Objetivo</div>
                                  <div className="font-bold">R$ {saasRevenueGoal.toFixed(0)}</div>
                              </div>
                          </div>
                          <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden relative z-10">
                              <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${mrrProgress >= 100 ? 'bg-green-500' : 'bg-green-400'}`}
                                  style={{ width: `${mrrProgress}%` }}
                              ></div>
                          </div>
                          <div className="text-right text-[10px] text-gray-400 mt-1 relative z-10">
                              {mrrProgress.toFixed(0)}% da meta
                          </div>
                      </Card>

                      {/* Celebration Card */}
                      <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <div className="bg-purple-100 p-2 rounded-full">
                                  <PartyPopper className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-purple-900">Novos Clientes</h3>
                                  <p className="text-xs text-purple-700">Este mês</p>
                              </div>
                          </div>
                          <div className="text-2xl font-bold text-purple-600">+{newSalonsCount}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <Card className="p-4 border-l-4 border-brand-500">
                              <div className="text-gray-500 text-xs uppercase mb-1">Total Salões</div>
                              <div className="text-2xl font-bold text-gray-900">{totalSalons}</div>
                              <div className="text-[10px] text-green-600 font-medium">{activeSalons} ativos</div>
                          </Card>
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                              <div className="text-blue-600 font-bold text-lg">{coupons.length}</div>
                              <div className="text-xs text-blue-400">Cupons Ativos</div>
                          </div>
                      </div>

                      <Card title="Saúde da Carteira">
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                 <span className="text-sm text-gray-600">Em dia</span>
                                 <div className="flex items-center gap-2">
                                     <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                         <div className="h-full bg-green-500" style={{ width: `${(activeSalons / totalSalons) * 100}%` }}></div>
                                     </div>
                                     <span className="text-xs font-bold">{activeSalons}</span>
                                 </div>
                             </div>
                             <div className="flex items-center justify-between">
                                 <span className="text-sm text-gray-600">Inadimplentes</span>
                                 <div className="flex items-center gap-2">
                                     <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                         <div className="h-full bg-red-500" style={{ width: `${(lateSalons / totalSalons) * 100}%` }}></div>
                                     </div>
                                     <span className="text-xs font-bold">{lateSalons}</span>
                                 </div>
                             </div>
                          </div>
                      </Card>
                  </div>
              );

          case 'clients':
              return (
                  <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2 px-1">
                          <h3 className="font-bold text-gray-700">Gestão de Assinaturas</h3>
                          <Badge color="gray">{salons.length} contratos</Badge>
                      </div>
                      
                      {salons.map(salon => (
                          <div key={salon.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <h4 className="font-bold text-gray-900">{salon.name}</h4>
                                      <p className="text-xs text-gray-500">Desde {new Date().toLocaleDateString()}</p>
                                  </div>
                                  <Badge color={salon.subscriptionStatus === 'active' ? 'green' : 'red'}>
                                      {salon.subscriptionStatus === 'active' ? 'Em dia' : 'Atrasado'}
                                  </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 py-3 border-t border-gray-50 mt-2">
                                  <div>
                                      <div className="text-[10px] text-gray-400 uppercase">Plano</div>
                                      <div className="font-medium text-sm capitalize">{salon.plan}</div>
                                  </div>
                                  <div>
                                      <div className="text-[10px] text-gray-400 uppercase">Valor</div>
                                      <div className="font-medium text-sm">R$ {salon.monthlyFee?.toFixed(2)}</div>
                                  </div>
                                  <div>
                                      <div className="text-[10px] text-gray-400 uppercase">Cobrança</div>
                                      <div className="font-medium text-sm text-gray-600">
                                          {new Date(salon.nextBillingDate).getDate()}/{new Date(salon.nextBillingDate).getMonth()+1}
                                      </div>
                                  </div>
                              </div>

                              <div className="flex gap-2 mt-2">
                                  {salon.subscriptionStatus === 'active' ? (
                                      <Button variant="outline" className="w-full text-xs py-1.5 h-auto text-red-600 border-red-100 hover:bg-red-50" onClick={() => toggleSalonStatus(salon.id)}>
                                          <Ban className="w-3 h-3 mr-1 inline" /> Bloquear / Marcar Atrasado
                                      </Button>
                                  ) : (
                                      <Button variant="outline" className="w-full text-xs py-1.5 h-auto text-green-600 border-green-100 hover:bg-green-50" onClick={() => toggleSalonStatus(salon.id)}>
                                          <CheckCircle className="w-3 h-3 mr-1 inline" /> Confirmar Pagamento
                                      </Button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </div>
              );

          case 'plans':
              return (
                  <div className="space-y-4">
                      <p className="text-sm text-gray-500 px-1">
                          Edite os planos abaixo. As alterações refletem imediatamente na Landing Page.
                      </p>
                      
                      {saasPlans.map(plan => (
                          <div key={plan.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                  <div className="font-bold text-gray-900">{plan.name}</div>
                                  {plan.isRecommended && <Badge color="blue">Destaque</Badge>}
                              </div>
                              
                              {editingPlan?.id === plan.id ? (
                                  <div className="p-4 space-y-3 bg-brand-50/50">
                                      <Input 
                                          label="Preço Mensal (R$)" 
                                          type="number" 
                                          value={editingPlan.price} 
                                          onChange={e => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})} 
                                          className="bg-white"
                                      />
                                      <Input 
                                          label="Adicional por Profissional (R$)" 
                                          type="number" 
                                          value={editingPlan.perProfessionalPrice} 
                                          onChange={e => setEditingPlan({...editingPlan, perProfessionalPrice: parseFloat(e.target.value)})} 
                                          className="bg-white"
                                      />
                                      <div className="flex gap-2">
                                          <Button className="flex-1" onClick={() => { updateSaaSPlan(editingPlan); setEditingPlan(null); }}>Salvar</Button>
                                          <Button variant="outline" className="flex-1" onClick={() => setEditingPlan(null)}>Cancelar</Button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="p-4">
                                      <div className="flex justify-between items-end mb-4">
                                          <div className="text-2xl font-extrabold text-gray-900">R$ {plan.price}</div>
                                          <div className="text-xs text-gray-500 mb-1">+ R$ {plan.perProfessionalPrice} / prof</div>
                                      </div>
                                      <ul className="text-xs text-gray-500 space-y-1 mb-4">
                                          {plan.features.slice(0,3).map((f, i) => <li key={i}>• {f}</li>)}
                                      </ul>
                                      <Button variant="outline" className="w-full" onClick={() => setEditingPlan(plan)}>
                                          <Pen className="w-3 h-3 mr-2 inline" /> Editar Preço
                                      </Button>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              );

          case 'coupons':
              return (
                  <div className="space-y-4">
                      <Card className="p-4 bg-brand-50 border-brand-100">
                          <h3 className="font-bold text-brand-900 mb-3 text-sm">Criar Novo Cupom</h3>
                          <div className="flex gap-2 mb-2">
                              <Input 
                                  placeholder="Código (ex: BLACK50)" 
                                  className="bg-white mb-0" 
                                  value={newCouponCode}
                                  onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                              />
                              <Input 
                                  type="number" 
                                  placeholder="%" 
                                  className="w-20 bg-white mb-0" 
                                  value={newCouponPercent}
                                  onChange={e => setNewCouponPercent(e.target.value)}
                              />
                          </div>
                          <Button 
                              className="w-full" 
                              onClick={() => {
                                  if(newCouponCode && newCouponPercent) {
                                      createCoupon(newCouponCode, parseFloat(newCouponPercent));
                                      setNewCouponCode('');
                                      setNewCouponPercent('');
                                  }
                              }}
                          >
                              Criar Cupom
                          </Button>
                      </Card>

                      <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-500 uppercase px-1">Cupons Ativos</h4>
                          {coupons.length === 0 && <p className="text-sm text-gray-400 px-1">Nenhum cupom criado.</p>}
                          {coupons.map(coupon => (
                              <div key={coupon.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                                  <div>
                                      <div className="font-mono font-bold text-lg text-brand-600">{coupon.code}</div>
                                      <div className="text-xs text-gray-500">{coupon.discountPercent}% de desconto</div>
                                  </div>
                                  <div className="text-right">
                                      <Badge color="blue">{coupon.uses} usos</Badge>
                                      <div className="text-[10px] text-green-600 font-bold mt-1">ATIVO</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              );
          default: return null;
      }
  };

  return (
    <AppShell
        header={Header}
        bottomNav={
            <MobileNav>
                <MobileNavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <MobileNavItem icon={<Users />} label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
                <MobileNavItem icon={<DollarSign />} label="Planos" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
                <MobileNavItem icon={<Tags />} label="Cupons" active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} />
            </MobileNav>
        }
    >
        <div className="p-4 pb-24">
            {renderContent()}
        </div>
    </AppShell>
  );
};
