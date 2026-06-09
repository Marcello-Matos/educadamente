# CONTRATO DE DESENVOLVIMENTO DE SISTEMA WEB

**CONTRATANTE:** ____________________________________  
**CNPJ/CPF:** ______________________________________  

**CONTRATADA:** ____________________________________  
**CNPJ/CPF:** ______________________________________  

---

## CLÁUSULA 1 – OBJETO

Constitui objeto deste contrato o desenvolvimento de **sistema web completo de gestão para clínica de psicologia**, incluindo painel administrativo e área do paciente.

O projeto compreenderá os seguintes módulos e funcionalidades:

- **Dashboard gerencial** com indicadores, gráficos e visão geral da clínica;
- **Cadastro completo de pacientes** com prontuário digital, histórico clínico e anexos;
- **Cadastro de profissionais/psicólogos** com registro profissional (CRP), cor personalizada na agenda e dados completos;
- **Cadastro de usuários do sistema** com perfis de acesso, permissões customizáveis por usuário e autenticação segura;
- **Agenda inteligente** com controle de sessões, visualização por profissional, cores distintas e status de comparecimento;
- **Controle financeiro** com registro de pagamentos, status de recebimento e acompanhamento;
- **Prontuário eletrônico** com formulários clínicos (anamnese, triagem, avaliação, evolução, encaminhamento, alta e alta por abandono);
- **Chat da equipe** em tempo real para comunicação entre profissionais;
- **Portal do paciente** com acesso a informações, lembretes e teleconsulta;
- **Módulo de tarefas e colaboração** entre membros da equipe;
- **Lembretes e notificações** integrados ao sistema;
- **Teleconsulta** com área dedicada para atendimento online;
- **Sistema de busca global** para localização rápida de pacientes, sessões e registros;
- **Layout responsivo** adaptado para desktop, tablet e mobile;
- **Banco de dados relacional** com todas as tabelas, relacionamentos e políticas de segurança (RLS);
- **Autenticação real e segura** com login por e-mail e senha, sessões gerenciadas e proteção de rotas;
- **Implantação inicial** e publicação do sistema.

Qualquer funcionalidade não descrita explicitamente acima será considerada desenvolvimento adicional e orçada separadamente.

---

## CLÁUSULA 2 – ESCOPO DO PROJETO

Antes do início do desenvolvimento será aprovado um documento de requisitos detalhado contendo:

- Funcionalidades de cada módulo;
- Telas e fluxos de navegação;
- Regras de negócio específicas da clínica;
- Permissões de acesso por perfil de usuário;
- Integrações necessárias.

Após aprovação do escopo, qualquer alteração poderá gerar custos adicionais e novo prazo de entrega.

---

## CLÁUSULA 3 – TECNOLOGIAS

O projeto utilizará as seguintes tecnologias:

- **Next.js 16** (framework React com App Router);
- **React 19** com TypeScript;
- **Tailwind CSS 4** para estilização e design responsivo;
- **Supabase** como backend (banco de dados PostgreSQL, autenticação, realtime e storage);
- **shadcn/ui** e componentes Radix UI para interface;
- **Recharts** para gráficos e indicadores;
- **Lucide React** para iconografia;
- **GitHub Pages** para hospedagem estática;
- **Supabase Auth** para autenticação real de usuários;
- **Supabase Realtime** para atualizações em tempo real (chat, agenda);
- APIs de terceiros quando necessário (WhatsApp, e-mail, etc.).

A CONTRATADA poderá substituir tecnologias por equivalentes de mercado quando necessário para melhor execução do projeto, comunicando a CONTRATANTE previamente.

---

## CLÁUSULA 4 – PRAZO

O prazo de desenvolvimento será de:  
**___ dias corridos**

Contados a partir de:
- Assinatura do contrato;
- Pagamento da primeira parcela;
- Envio de todo material necessário (logomarca, textos, dados dos profissionais, etc.).

Caso a CONTRATANTE atrase aprovações, envio de informações ou feedback, o prazo será automaticamente prorrogado pelo mesmo período de atraso.

---

## CLÁUSULA 5 – VALOR

O valor total do projeto será de:  
**R$ ____________,00**

Forma de pagamento:
- Entrada: R$ ____________,00
- ___ parcelas de R$ ____________,00

Vencimento das parcelas: todo dia ___ de cada mês.

---

## CLÁUSULA 6 – INADIMPLÊNCIA

Em caso de atraso no pagamento:
- Multa de 2% sobre o valor da parcela;
- Juros de 1% ao mês;
- Correção monetária pelo índice oficial.

Após 15 dias de atraso:
- Acesso ao sistema poderá ser suspenso;
- Entregas poderão ser interrompidas até regularização.

---

## CLÁUSULA 7 – OBRIGAÇÕES DA CONTRATADA

A CONTRATADA compromete-se a:
- Desenvolver o sistema conforme escopo aprovado e funcionalidades descritas;
- Manter comunicação periódica com relatórios de progresso;
- Corrigir erros e bugs identificados durante o desenvolvimento e período de garantia;
- Entregar o sistema funcional, testado e documentado;
- Disponibilizar treinamento básico de utilização para os usuários;
- Garantir a segurança dos dados com políticas RLS no banco de dados;
- Fornecer suporte técnico durante o período de garantia.

---

## CLÁUSULA 8 – OBRIGAÇÕES DA CONTRATANTE

A CONTRATANTE compromete-se a:
- Fornecer todas as informações necessárias para o desenvolvimento (dados dos profissionais, pacientes, logomarca, textos, etc.);
- Aprovar etapas do projeto dentro do prazo acordado;
- Responder solicitações e feedbacks em até 5 dias úteis;
- Efetuar pagamentos nas datas acordadas;
- Designar uma pessoa responsável para comunicação com a CONTRATADA.

A ausência de resposta por mais de 15 dias poderá acarretar suspensão do cronograma sem prorrogação automática.

---

## CLÁUSULA 9 – ALTERAÇÃO DE ESCOPO

Serão considerados **fora do escopo** original e sujeitos a orçamento adicional:

- Novas telas ou módulos não previstos no escopo aprovado;
- Novas funcionalidades além das descritas na Cláusula 1;
- Integrações com sistemas externos não previstos (ERP, planos de saúde, etc.);
- Mudanças estruturais no banco de dados após aprovação;
- Alterações visuais ou de layout após aprovação do design;
- Importação em massa de dados históricos de sistemas anteriores;
- Desenvolvimento de aplicativo mobile nativo (iOS/Android);
- Implementação de gateway de pagamento online.

Tais solicitações serão orçadas separadamente e poderão exigir novo prazo de entrega.

---

## CLÁUSULA 10 – HOSPEDAGEM E SERVIÇOS DE TERCEIROS

**Não estão incluídos no valor contratado:**

- Hospedagem do sistema (frontend e backend);
- Domínio personalizado (ex: clinica.com.br);
- Certificados SSL;
- APIs pagas (WhatsApp Business API, envio de SMS, gateway de pagamento);
- Serviços de envio de e-mails transacionais (SendGrid, AWS SES, etc.);
- Serviços de SMS;
- Planos pagos do Supabase (além do tier gratuito);
- Infraestrutura em nuvem (AWS, Google Cloud, Azure);
- Licenças de software de terceiros.

Esses custos serão de responsabilidade exclusiva da CONTRATANTE, que deverá contratá-los diretamente ou solicitar que a CONTRATADA faça em seu nome mediante reembolso.

---

## CLÁUSULA 11 – PROPRIEDADE INTELECTUAL

**Até a quitação integral:**
- Todo código-fonte;
- Layouts e design;
- Documentação técnica;
- Banco de dados e estrutura;
- Permanecerão de propriedade da CONTRATADA.

**Após a quitação total:**
A CONTRATANTE receberá:
- ☐ Licença permanente de uso do sistema (acesso contínuo);
- ☐ Código-fonte completo para hospedagem própria;

(Escolher uma opção antes da assinatura.)

**Dados da CONTRATANTE:**  
Todos os dados inseridos no sistema (pacientes, profissionais, sessões, pagamentos) são de propriedade exclusiva da CONTRATANTE desde o primeiro momento.

---

## CLÁUSULA 12 – GARANTIA

A CONTRATADA fornecerá garantia de **___ dias** para correção de falhas de programação, bugs e erros de funcionamento identificados após a entrega.

**Não estão cobertos pela garantia:**
- Novas funcionalidades ou módulos;
- Alterações de layout ou design;
- Mudanças de escopo ou regras de negócio;
- Falhas causadas por terceiros (hospedagem, internet, APIs externas);
- Problemas originados de uso incorreto do sistema;
- Perda de dados por falta de backup.

---

## CLÁUSULA 13 – SUPORTE E MANUTENÇÃO

**Após o período de garantia**, qualquer manutenção ou suporte será cobrado mediante orçamento prévio.

O suporte não inclui:
- Desenvolvimento de novas funções ou módulos;
- Treinamento adicional (além do incluído na entrega);
- Alterações visuais ou de layout;
- Integrações extras com sistemas externos;
- Backup e recuperação de dados (responsabilidade da CONTRATANTE);
- Migração de hospedagem.

A CONTRATADA poderá oferecer plano de manutenção mensal mediante contrato à parte.

---

## CLÁUSULA 14 – LGPD E PROTEÇÃO DE DADOS

As partes comprometem-se a cumprir integralmente a **Lei nº 13.709/2018 (LGPD)** e normas correlatas.

**Responsabilidades:**
- A CONTRATANTE é o **Controlador** dos dados e será responsável pelos dados inseridos no sistema (pacientes, prontuários, etc.);
- A CONTRATADA é o **Operador** e processará os dados apenas para execução do serviço contratado;
- A CONTRATADA implementará medidas técnicas de segurança (autenticação, criptografia, RLS, backup).

**A CONTRATADA não responderá por vazamentos decorrentes de:**
- Senhas compartilhadas ou fracas;
- Uso inadequado do sistema por usuários;
- Falhas da infraestrutura contratada pela CONTRATANTE;
- Ataques cibernéticos decorrentes de negligência da CONTRATANTE.

---

## CLÁUSULA 15 – BACKUP E SEGURANÇA

A CONTRATADA implementará:
- Autenticação segura com controle de sessões;
- Políticas RLS (Row Level Security) no banco de dados;
- Restrições de acesso por perfil de usuário;
- Criptografia de dados sensíveis.

**Backup dos dados:**
- ☐ A CONTRATADA realizará backup automático (diário/semanal);
- ☐ A CONTRATANTE será responsável por realizar backups;

(Escolher uma opção antes da assinatura.)

---

## CLÁUSULA 16 – LIMITAÇÃO DE RESPONSABILIDADE

A CONTRATADA não se responsabiliza por:
- Indisponibilidade de servidores de hospedagem;
- Falhas de internet ou conectividade;
- Problemas de provedores de serviço;
- APIs de terceiros fora do escopo;
- Serviços externos contratados pela CONTRATANTE;
- Perda de dados por falta de backup;
- Uso indevido do sistema por usuários autorizados.

A responsabilidade financeira máxima da CONTRATADA ficará limitada ao valor efetivamente pago neste contrato.

---

## CLÁUSULA 17 – RESCISÃO

O contrato poderá ser rescindido por qualquer das partes mediante comunicação formal por e-mail ou carta registrada.

**Em caso de cancelamento:**

| Situação | Tratamento |
|----------|------------|
| Antes do início do desenvolvimento | Devolução integral dos valores pagos |
| Após início e até 50% do projeto | Devolução de 50% dos valores pagos |
| Após 50% do projeto | Os valores pagos não serão devolvidos; será devido pagamento proporcional às horas já trabalhadas |
| Por inadimplência da CONTRATANTE | Suspensão imediata; valores não devolvidos |

---

## CLÁUSULA 18 – PORTFÓLIO

A CONTRATADA poderá utilizar para divulgação profissional e portfólio:
- Imagens e capturas de tela do sistema (sem dados reais de pacientes);
- Nome do projeto e da clínica;
- Depoimento da CONTRATANTE (mediante autorização prévia).

**A CONTRATANTE poderá solicitar sigilo total:**  
☐ Sim  ☐ Não

---

## CLÁUSULA 19 – CONFIDENCIALIDADE

Ambas as partes se comprometem a manter sigilo sobre:
- Dados de pacientes e profissionais;
- Informações financeiras da clínica;
- Estratégias de negócio;
- Código-fonte e documentação técnica (até a quitação).

Esta obrigação permanece mesmo após o término do contrato.

---

## CLÁUSULA 20 – ASSINATURA ELETRÔNICA

As partes reconhecem a validade jurídica de assinaturas realizadas por plataformas digitais certificadas (DocuSign, ClickSign, etc.), nos termos da **Medida Provisória nº 2.200-2/2001** e **Lei nº 14.063/2020**.

---

## CLÁUSULA 21 – FORO

Fica eleito o foro da comarca de **___________________________** para dirimir quaisquer controvérsias oriundas deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.

---

## ASSINATURAS

### CONTRATANTE
**Nome/Razão Social:** ________________________________________________  
**CPF/CNPJ:** _________________________________________________________  
**Endereço:** _________________________________________________________  
**E-mail:** ___________________________________________________________  
**Telefone:** _________________________________________________________  
**Assinatura:** _______________________________________________________  
**Data:** ____ / ____ / ________

---

### CONTRATADA
**Nome/Razão Social:** ________________________________________________  
**CPF/CNPJ:** _________________________________________________________  
**Endereço:** _________________________________________________________  
**E-mail:** ___________________________________________________________  
**Telefone:** _________________________________________________________  
**Assinatura:** _______________________________________________________  
**Data:** ____ / ____ / ________

---

## ANEXO I – FUNCIONALIDADES DETALHADAS

### Módulos do Sistema Educadamente

1. **Dashboard** — Visão geral da clínica com indicadores, gráficos e estatísticas
2. **Pacientes** — Cadastro completo com prontuário, histórico e documentos
3. **Agenda** — Calendário de sessões com controle de status e cores por profissional
4. **Tarefas** — Gestão de tarefas da equipe com prioridades
5. **Lembretes** — Sistema de lembretes e notificações
6. **Chat da Equipe** — Comunicação em tempo real entre profissionais
7. **Financeiro** — Controle de pagamentos, recebimentos e status
8. **Prontuários** — Formulários clínicos completos (anamnese, triagem, avaliação, evolução, encaminhamento, alta, alta por abandono)
9. **Teleconsulta** — Área para atendimentos online
10. **Portal do Paciente** — Acesso do paciente a informações e agendamentos
11. **Usuários** — Gestão de usuários, perfis de acesso e permissões customizáveis
12. **Configurações** — Personalização do sistema

---

*Documento gerado em: ____ / ____ / ________*
