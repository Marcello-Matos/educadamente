"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, Eye, EyeOff, Shield, User, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegistroPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
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
              {step === 1 ? (
                <>
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
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      CRP (Registro Profissional) *
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 06/123456"
                      required
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
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Especialidade
                    </label>
                    <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
                        required
                      />
                    </div>
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
                        required
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
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 mt-0.5"
                      required
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
                <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Fazer login
                </a>
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
