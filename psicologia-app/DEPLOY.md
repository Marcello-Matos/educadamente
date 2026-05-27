# Como subir no GitHub Pages

## 1. Criar repositório no GitHub

1. Acesse https://github.com/new
2. Dê um nome ao repositório (ex: `educadamente`)
3. Deixe como **Público**
4. Clique em **Create repository**

## 2. Enviar o código para o GitHub

No terminal, dentro da pasta do projeto (`psicologia-app`), execute:

```bash
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
git push -u origin main
```

> Troque `SEU-USUARIO` e `NOME-DO-REPO` pelos seus dados.

## 3. Ativar GitHub Pages

1. No GitHub, vá em **Settings** → **Pages** (no menu lateral esquerdo)
2. Em **Build and deployment**, selecione:
   - **Source:** GitHub Actions
3. Pronto! O deploy vai iniciar automaticamente.

## 4. Acessar o site

Depois de alguns minutos, seu site estará disponível em:

```
https://SEU-USUARIO.github.io/NOME-DO-REPO/
```

> Exemplo: `https://marcelo.github.io/educadamente/`

## 5. Atualizar o site

Sempre que fizer alterações e quiser atualizar:

```bash
git add .
git commit -m "Nova versão"
git push
```

O GitHub Actions fará o deploy automaticamente.

---

## Importante

- O arquivo `next.config.ts` da pasta local **permanece limpo** (sem `output: "export"`) para o desenvolvimento funcionar normalmente.
- O workflow `deploy.yml` sobrescreve essa configuração **somente durante o build** no GitHub.
