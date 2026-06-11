# Como Configurar Notificações Automáticas (E-mail & WhatsApp)

Quando você agenda uma sessão na **Agenda**, o sistema pode enviar automaticamente:

- **E-mail** de confirmação para o paciente
- **WhatsApp** de confirmação para o paciente

---

## 1. E-mail (Resend) — GRÁTIS até 3.000/mês

1. Acesse https://resend.com e crie uma conta gratuita
2. Vá em **API Keys** e gere uma chave
3. Copie para o seu `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```

> **Pronto!** Todo agendamento novo vai enviar um e-mail bonito de confirmação.

---

## 2. WhatsApp (CallMeBot) — GRÁTIS para testes

1. Abra no navegador:
   ```
   https://api.callmebot.com/whatsapp.php?phone=SEUNUMERO&text=START&apikey=KEY
   ```
   (Substitua `SEUNUMERO` pelo seu número com DDD, ex: `5511999999999`)
2. Você receberá uma mensagem no WhatsApp. Responda com **START**
3. O site vai mostrar sua **API Key**
4. Copie para o seu `.env.local`:
   ```
   CALLMEBOT_API_KEY=xxxxxx
   ```

> **Pronto!** O paciente recebe um WhatsApp automático a cada agendamento.

---

## 3. WhatsApp (Z-API) — Pago, mas profissional

Ideal para clínicas que precisam de WhatsApp profissional.

1. Acesse https://z-api.io e crie uma conta
2. Conecte seu número de WhatsApp
3. Pegue o **Instance ID** e **Token**
4. Copie para o seu `.env.local`:
   ```
   ZAPI_INSTANCE=xxxxxxxx
   ZAPI_TOKEN=xxxxxxxx
   ```

---

## Como funciona

- Ao criar um **novo agendamento** na Agenda, o sistema envia automaticamente
- O paciente precisa ter **e-mail** e/ou **telefone** cadastrados no sistema
- Se o paciente não tiver e-mail, envia só WhatsApp (e vice-versa)
- Se não tiver nenhum provedor configurado, o agendamento continua normalmente — sem erros

---

## Testando

1. Configure o `.env.local` com as chaves
2. Reinicie o servidor (`npm run dev`)
3. Crie um agendamento para um paciente que tenha e-mail ou telefone
4. Verifique se aparece a mensagem: *"Notificação enviada — E-mail e WhatsApp enviados ao paciente."*
