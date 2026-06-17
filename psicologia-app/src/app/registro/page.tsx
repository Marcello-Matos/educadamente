"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, Shield, User, Phone, ArrowLeft, AlertCircle, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { signUp } from "@/lib/supabase/auth";
import { createPsychologist, checkCrpExists } from "@/lib/supabase/patients";
import { createSystemUser } from "@/lib/supabase/users";
import { uploadProfilePhoto, updatePsychologistPhoto } from "@/lib/supabase/photos";
import { toast } from "@/hooks/use-toast";

export default function RegistroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // form
  const [name, setName] = useState("");
  const [crp, setCrp] = useState("");
  const [phone, setPhone] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (file.size > 5 * 1024 * 1024) {
      setError("A foto deve ter no máximo 5MB");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Formato não suportado. Use JPEG, PNG, WebP ou GIF");
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      if (!name || !email || !crp || !phone) { setError("Preencha nome, e-mail, CRP e telefone."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Informe um e-mail válido."); return; }
      setStep(2);
      return;
    }
    if (!password) { setError("Crie uma senha."); return; }
    if (password.length < 8) { setError("A senha deve ter ao menos 8 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (!accepted) { setError("Você precisa aceitar os termos."); return; }

    // Verifica se o CRP já existe antes de criar a conta
    setLoading(true);
    try {
      const crpExists = await checkCrpExists(crp.trim());
      if (crpExists) {
        setError("Este CRP já está cadastrado. Use um registro profissional diferente.");
        setLoading(false);
        return;
      }

      const result = await signUp(email, password, { name, crp, phone, specialty });
      // Cria o registro do profissional (aparece na agenda, chat, etc.)
      const psych = await createPsychologist({ name, crp, email, phone, specialties: specialty ? [specialty] : [] });
      // Upload da foto de perfil se foi selecionada
      if (photoFile && psych.id) {
        try {
          setUploadingPhoto(true);
          const { url } = await uploadProfilePhoto(photoFile, psych.id);
          await updatePsychologistPhoto(psych.id, url);
        } catch (photoErr) {
          console.error("Erro ao fazer upload da foto:", photoErr);
          // Não impede o registro se a foto falhar
        } finally {
          setUploadingPhoto(false);
        }
      }
      // Cria o usuário do sistema (aparece na página Usuários)
      try { await createSystemUser({ name, email, phone, role: crp ? `Psicólogo - ${crp}` : "Psicólogo", profileId: "", status: "ativo" }); } catch { /* ignora se já existe */ }

      if (result.session) {
        router.replace("/dashboard");
      } else {
        toast.success("Conta criada!", "Confirme seu e-mail para ativar o acesso.");
        router.replace("/login");
      }
    } catch (err) {
      const msg = (err as { message?: string })?.message || "";
      const m = msg.toLowerCase();
      if (m.includes("already registered") || m.includes("already been registered")) setError("Este e-mail já está cadastrado.");
      else if (m.includes("duplicate key")) setError("Este CRP já está cadastrado.");
      else if (m.includes("rate limit")) setError("Limite de envio de e-mails do Supabase atingido. Aguarde 1 hora ou desative a confirmação de e-mail no painel do Supabase (Authentication > Providers > Email > Confirm email).");
      else if (m.includes("password")) setError("Senha rejeitada pelo servidor: " + msg);
      else setError(msg ? `Erro: ${msg}` : "Não foi possível criar a conta. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
            alt="Logo Sistema Educadamente"
            width={64}
            height={64}
            className="mx-auto mb-4 rounded-2xl"
          />
          <h1 className="text-3xl font-bold text-gray-900">Sistema Educadamente</h1>
          <p className="text-gray-500 mt-1">Crie sua conta para acessar o sistema</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-semibold text-center text-gray-900 flex-1">
                {step === 1 ? "Dados Pessoais" : "Dados de Acesso"}
              </h2>
              <span className="text-xs text-gray-400">Passo {step}/2</span>
            </div>
            {/* Progress bar */}
            <div className="flex gap-2 mt-3">
              <div className="h-1.5 flex-1 rounded-full bg-indigo-600" />
              <div className={`h-1.5 flex-1 rounded-full ${step === 2 ? "bg-indigo-600" : "bg-gray-200"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Foto de Perfil
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                        {photoPreview && (
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="photo-upload"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          {photoFile ? "Trocar foto" : "Adicionar foto"}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP ou GIF (máx. 5MB)</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Seu nome completo"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Você usará este e-mail para acessar o sistema.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      CRP (Registro Profissional) *
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 06/123456"
                      value={crp}
                      onChange={(e) => setCrp(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telefone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className="pl-10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Especialidade
                    </label>
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione sua especialidade</option>
                      <option value="tcc">TCC - Terapia Cognitivo Comportamental</option>
                      <option value="psicanalise">Psicanálise</option>
                      <option value="humanista">Humanista</option>
                      <option value="sistemica">Sistêmica</option>
                      <option value="infantil">Psicologia Infantil</option>
                      <option value="casal">Terapia de Casal</option>
                      <option value="neuropsicologia">Neuropsicologia</option>
                      <option value="outra">Outra</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2 text-sm text-indigo-700">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>Conta: <strong>{email}</strong></span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use letras, números e caracteres especiais
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirmar Senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                        className="pl-10"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 mt-0.5"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    <span className="text-xs text-gray-600">
                      Li e aceito os{" "}
                      <a href="#" className="text-indigo-600 hover:underline">Termos de Uso</a>{" "}
                      e a{" "}
                      <a href="#" className="text-indigo-600 hover:underline">Política de Privacidade (LGPD)</a>
                    </span>
                  </div>
                </>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Criando conta...
                  </span>
                ) : step === 1 ? (
                  "Continuar"
                ) : (
                  "Criar Minha Conta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Fazer login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Protegido por criptografia AES-256 • Conformidade LGPD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
