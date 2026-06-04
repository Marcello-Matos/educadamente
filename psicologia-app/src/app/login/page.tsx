"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { signIn, resetPassword } from "@/lib/supabase/auth";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch (err) {
      const msg = (err as { message?: string })?.message || "";
      if (msg.includes("Invalid login")) setError("E-mail ou senha incorretos.");
      else if (msg.includes("Email not confirmed")) setError("Confirme seu e-mail antes de entrar.");
      else setError("Não foi possível entrar. Tente novamente.");
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) { toast.warning("Informe seu e-mail", "Digite o e-mail no campo acima e clique novamente."); return; }
    try {
      await resetPassword(email);
      toast.success("E-mail enviado", "Verifique sua caixa de entrada para redefinir a senha.");
    } catch {
      toast.error("Erro", "Não foi possível enviar o e-mail de redefinição.");
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-tight">Sistema Educadamente</h1>
          <p className="text-gray-500 mt-1 leading-relaxed">Sistema de Gestão para Psicólogos</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <h2 className="text-xl font-semibold tracking-tight text-center text-gray-900 leading-tight">
              Entrar no Sistema
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-indigo-600" defaultChecked />
                  <span className="text-gray-600">Lembrar de mim</span>
                </label>
                <button type="button" onClick={handleForgot} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Esqueceu a senha?
                </button>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <a href="/registro" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Cadastre-se
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
