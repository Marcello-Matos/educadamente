# PsiClinic - Sistema de Gestão para Psicólogos

Sistema completo de gestão clínica para psicólogos com prontuário eletrônico, agenda inteligente, financeiro, teleconsulta e portal do paciente.

## Funcionalidades

### Dashboard Administrativo
- Quantidade de pacientes ativos
- Sessões realizadas no mês
- Faturamento mensal com gráficos
- Psicólogos ativos
- Métricas e KPIs em tempo real

### Cadastro de Pacientes
- Cadastro completo com dados pessoais
- Histórico clínico
- Anamnese digital
- Upload de documentos
- Evolução do paciente
- Observações privadas do psicólogo

### Agenda Inteligente
- Agendamento online
- Controle de sessões (presencial e teleconsulta)
- Lembrete automático via WhatsApp/Email
- Calendário individual por psicólogo
- Reagendamento automático
- Controle de faltas

### Financeiro
- Controle de pagamentos (PIX, cartão, boleto)
- Emissão de recibos
- Relatórios financeiros com gráficos
- Controle de inadimplência
- Plano mensal/anual de pacientes

### Prontuário Eletrônico
- Registro das sessões
- Evolução terapêutica
- CID e diagnósticos
- Assinatura digital
- Histórico completo protegido

### Teleconsulta
- Videochamada integrada
- Chat durante a sessão
- Compartilhamento de arquivos
- Sala virtual segura e criptografada

### Portal do Paciente
- Login seguro
- Agendar consultas
- Ver histórico de sessões
- Baixar recibos
- Acesso à teleconsulta

## Conformidade LGPD

- Criptografia AES-256 para dados sensíveis
- Consentimento do paciente obrigatório
- Log de acessos completo
- Direito ao esquecimento implementado
- Backup automático diário

## Tecnologias

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Componentes:** Radix UI
- **Ícones:** Lucide React
- **Gráficos:** Recharts
- **Datas:** date-fns

## Como Executar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura do Projeto

```
src/
├── app/
│   ├── (admin)/           # Rotas administrativas com sidebar
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── pacientes/     # Gestão de pacientes
│   │   ├── agenda/        # Agenda inteligente
│   │   ├── financeiro/    # Controle financeiro
│   │   ├── prontuarios/   # Prontuário eletrônico
│   │   ├── teleconsulta/  # Videochamada
│   │   ├── portal/        # Portal do paciente
│   │   └── configuracoes/ # Configurações do sistema
│   ├── login/             # Página de login
│   └── page.tsx           # Redirect para dashboard
├── components/
│   ├── layout/            # Sidebar e Header
│   └── ui/                # Componentes reutilizáveis
└── lib/
    ├── utils.ts           # Utilitários
    └── mock-data.ts       # Dados de demonstração
```

## Credenciais de Teste

- **Email:** maria@clinica.com
- **Senha:** 12345678
