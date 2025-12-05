import React from 'react';
import { Button } from '../components/UI';
import { ChevronLeft, FileText } from 'lucide-react';

export const TermsOfUse: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans pb-20">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="text-xs flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2 font-bold text-gray-900">
             <FileText className="w-5 h-5 text-brand-600" />
             Termos de Uso
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-gray-700">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Termos e Condições de Uso</h1>
            <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString()}</p>
        </div>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">1. Aceitação dos Termos</h2>
            <p>
                Ao acessar e utilizar a plataforma <strong>Agende +</strong>, você concorda integralmente com estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, você não deve utilizar nosso serviço.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">2. Descrição do Serviço</h2>
            <p>
                O Agende + é uma plataforma SaaS (Software as a Service) que oferece ferramentas de gestão para empresas de serviços 
                (salões, barbearias, lava rápidos, clínicas). Nossos serviços incluem agendamento online, gestão financeira, controle de estoque 
                e ferramentas de marketing.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">3. Responsabilidades do Usuário</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso.</li>
                <li>Você concorda em fornecer informações verdadeiras, exatas e completas durante o cadastro.</li>
                <li>É proibido utilizar a plataforma para atividades ilegais ou não autorizadas.</li>
                <li>O Proprietário da empresa é o único responsável pela qualidade dos serviços prestados aos seus clientes finais.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">4. Pagamentos e Assinaturas</h2>
            <p>
                O acesso às funcionalidades avançadas requer o pagamento de uma assinatura mensal. 
                O não pagamento da mensalidade pode resultar na suspensão ou cancelamento do acesso à plataforma.
                Os valores podem ser reajustados mediante aviso prévio.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">5. Propriedade Intelectual</h2>
            <p>
                Todo o conteúdo, design, código e software da plataforma Agende + são de propriedade exclusiva da nossa empresa 
                e estão protegidos pelas leis de direitos autorais e propriedade intelectual.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">6. Limitação de Responsabilidade</h2>
            <p>
                O Agende + atua como intermediário tecnológico. Não nos responsabilizamos por:
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Cancelamentos de agendamentos por parte dos clientes ou profissionais.</li>
                <li>Insatisfação com os serviços prestados pelas empresas cadastradas.</li>
                <li>Instabilidades temporárias no sistema decorrentes de manutenção ou falhas de terceiros.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">7. Alterações nos Termos</h2>
            <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente 
                após a publicação na plataforma. O uso contínuo do serviço após as alterações constitui aceitação dos novos termos.
            </p>
        </section>

        <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
                Em caso de dúvidas sobre estes termos, entre em contato através do nosso suporte.
            </p>
        </div>
      </div>
    </div>
  );
};