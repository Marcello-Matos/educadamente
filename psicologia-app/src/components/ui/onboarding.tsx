"use client";

import { useState, useEffect } from "react";
import { X, LayoutDashboard, Users, Calendar, CreditCard, FileText, Video, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Sparkles,
    color: "bg-indigo-500",
    title: "Bem-vindo ao Sistema Educadamente!",
    description: "Seu sistema completo de gestão para psicólogos. Vamos mostrar as principais funcionalidades em poucos passos.",
  },
  {
    icon: LayoutDashboard,
    color: "bg-blue-500",
    title: "Dashboard",
    description: "Visão geral da clínica com KPIs, faturamento mensal, sessões por tipo e próximas consultas.",
  },
  {
    icon: Users,
    color: "bg-emerald-500",
    title: "Pacientes",
    description: "Cadastre e gerencie seus pacientes com ficha completa, histórico e dados de contato.",
  },
  {
    icon: Calendar,
    color: "bg-amber-500",
    title: "Agenda",
    description: "Visualize e crie sessões por dia. Filtre por psicólogo e gerencie presenciais ou teleconsultas.",
  },
  {
    icon: CreditCard,
    color: "bg-rose-500",
    title: "Financeiro",
    description: "Controle pagamentos, visualize gráficos de receita vs despesas e exporte relatórios.",
  },
  {
    icon: FileText,
    color: "bg-purple-500",
    title: "Prontuários",
    description: "Fichas de triagem (crianças e adultos) e anamnese psicopedagógica com salvamento automático.",
  },
  {
    icon: Video,
    color: "bg-teal-500",
    title: "Teleconsulta",
    description: "Salas virtuais simultâneas com criptografia. Acesse pelo link ou crie salas rápidas.",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding-done");
    if (!seen) {
      setTimeout(() => setOpen(true), 800);
    }
  }, []);

  const close = () => {
    setLeaving(true);
    setTimeout(() => {
      setOpen(false);
      localStorage.setItem("onboarding-done", "1");
    }, 200);
  };

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else close();
  };

  if (!open) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4 transition-opacity duration-200 ${leaving ? "opacity-0" : "opacity-100"}`}
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header color band */}
        <div className={`${current.color} p-8 flex flex-col items-center text-white text-center`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold leading-snug">{current.title}</h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed text-center">{current.description}</p>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 my-5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-indigo-500" : "w-1.5 bg-gray-200"}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={close}>
              Pular tour
            </Button>
            <Button className="flex-1 gap-1" onClick={next}>
              {isLast ? "Começar!" : "Próximo"}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <button
          onClick={close}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
