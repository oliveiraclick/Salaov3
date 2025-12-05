import React from 'react';
import { Button } from '../components/UI';
import { ChevronLeft, Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full overflow-y-auto bg-gray-50 font-sans pb-20">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="text-xs flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2 font-bold text-gray-900">
             <Shield className="w-5 h-5 text-green-600" />
             Política de Privacidade
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-gray-700">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Política de Privacidade</h1>
            <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString()}</p>
        </div>

        <section className="space-y-4">
            <p className="text-lg text-gray-600">
                A sua privacidade é importante para nós. Esta política explica como o <strong>Agende +</strong> coleta, usa e protege suas informações pessoais.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">1. Informações que Coletamos</h2>
            <p>Coletamos informações necessárias para o funcionamento do serviço, incluindo:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Dados de Cadastro:</strong> Nome, e-mail, telefone e data de nascimento.</li>
                <li><strong>Dados da Empresa:</strong> Endereço, serviços oferecidos, preços e horários.</li>
                <li><strong>Dados de Agendamento:</strong> Histórico de serviços, datas e preferências.</li>
                <li><strong>Dados Financeiros:</strong> Informações de transações para processamento de pagamentos (não armazenamos dados completos de cartão de crédito).</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">2. Como Usamos seus Dados</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Processar agendamentos e garantir que o profissional saiba quem irá atender.</li>
                <li>Enviar lembretes de horários e confirmações via WhatsApp ou E-mail.</li>
                <li>Melhorar nossos serviços e desenvolver novas funcionalidades.</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">3. Compartilhamento de Informações</h2>
            <p>
                Não vendemos seus dados pessoais. Compartilhamos informações apenas nas seguintes situações:
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Com a Empresa/Profissional:</strong> Para que o serviço agendado possa ser realizado.</li>
                <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou ordem judicial.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">4. Segurança dos Dados</h2>
            <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, 
                perda ou alteração. Utilizamos criptografia e protocolos seguros de comunicação.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">5. Seus Direitos (LGPD)</h2>
            <p>
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Acessar seus dados pessoais armazenados.</li>
                <li>Corrigir dados incompletos ou inexatos.</li>
                <li>Solicitar a exclusão de seus dados (quando aplicável).</li>
                <li>Revogar seu consentimento para uso de dados.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">6. Cookies</h2>
            <p>
                Utilizamos cookies e tecnologias similares para melhorar a experiência de navegação, lembrar suas preferências 
                e manter sua sessão ativa.
            </p>
        </section>

        <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
                Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato através do nosso canal de suporte.
            </p>
        </div>
      </div>
    </div>
  );
};