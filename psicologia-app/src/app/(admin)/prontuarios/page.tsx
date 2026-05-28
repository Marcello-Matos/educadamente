"use client";

import { useState } from "react";
import {
  FileText,
  Lock,
  Shield,
  Baby,
  UserCheck,
  BookOpen,
  X,
  Printer,
  Save,
  Eye,
  Trash2,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type FichaModal = null | "triagem-crianca" | "triagem-adulto" | "anamnese-psicopedagogia";

interface SavedFicha {
  id: string;
  patientId: string;
  type: FichaModal;
  date: string;
  patientName: string;
}

const fichaLabels: Record<string, { label: string; sub: string; color: string; bg: string; border: string }> = {
  "triagem-crianca": { label: "Triagem Inicial", sub: "Crianças / Adolescentes", color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200" },
  "triagem-adulto": { label: "Triagem Inicial", sub: "Adultos", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  "anamnese-psicopedagogia": { label: "Ficha de Anamnese", sub: "Psicopedagogia - Psicológica", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
};

export default function ProntuariosPage() {
  const [fichaModal, setFichaModal] = useState<FichaModal>(null);
  const [searchFicha, setSearchFicha] = useState("");
  const [savedFichas, setSavedFichas] = useState<SavedFicha[]>([]);

  const filteredFichas = savedFichas.filter((f) =>
    f.patientName.toLowerCase().includes(searchFicha.toLowerCase())
  );

  const saveFicha = () => {
    if (!fichaModal) return;
    const newFicha: SavedFicha = {
      id: `f-${Date.now()}`,
      patientId: "",
      type: fichaModal,
      date: new Date().toISOString().split("T")[0],
      patientName: "Paciente",
    };
    setSavedFichas((prev) => [newFicha, ...prev]);
    setFichaModal(null);
  };

  const deleteFicha = (id: string) => {
    setSavedFichas((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Prontuário Eletrônico</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Registro seguro das sessões e evolução terapêutica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="flex items-center gap-1 text-xs">
            <Shield className="w-3 h-3" />
            LGPD
          </Badge>
          <Badge variant="default" className="flex items-center gap-1 text-xs">
            <Lock className="w-3 h-3" />
            Criptografado
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
              {/* â”€â”€â”€ FICHAS BUTTONS â”€â”€â”€ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setFichaModal("triagem-crianca")}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-pink-200 bg-pink-50/50 hover:bg-pink-100/60 hover:border-pink-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                    <Baby className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Triagem Inicial</p>
                    <p className="text-xs text-pink-600">Crianças / Adolescentes</p>
                  </div>
                </button>

                <button
                  onClick={() => setFichaModal("triagem-adulto")}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 hover:border-blue-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Triagem Inicial</p>
                    <p className="text-xs text-blue-600">Adultos</p>
                  </div>
                </button>

                <button
                  onClick={() => setFichaModal("anamnese-psicopedagogia")}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 hover:border-purple-300 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Anamnese</p>
                    <p className="text-xs text-purple-600">Psicopedagogia - Psicológica</p>
                  </div>
                </button>
              </div>

              {/* Fichas Preenchidas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Fichas Preenchidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input placeholder="Buscar paciente..." className="pl-10" value={searchFicha} onChange={(e) => setSearchFicha(e.target.value)} />
                    </div>
                    {filteredFichas.length > 0 ? (
                      filteredFichas.map((ficha) => {
                        const meta = fichaLabels[ficha.type!];
                        return (
                          <div
                            key={ficha.id}
                            className={`p-4 rounded-lg border ${meta.border} ${meta.bg} flex items-center justify-between`}
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <p className={`text-sm font-semibold ${meta.color}`}>{meta.label}</p>
                                <p className="text-xs text-gray-500">{meta.sub}</p>
                              </div>
                              <span className="text-xs text-gray-600 font-medium">{ficha.patientName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">{ficha.date}</span>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="w-4 h-4 text-gray-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteFicha(ficha.id)}>
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Nenhuma ficha preenchida
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
      </div>

      {/* â”€â”€â”€ FICHA MODALS â”€â”€â”€ */}
      {fichaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={() => setFichaModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* â”€â”€â”€ TRIAGEM CRIANÇAS / ADOLESCENTES â”€â”€â”€ */}
            {fichaModal === "triagem-crianca" && (
              <>
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-pink-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Baby className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">TRIAGEM INICIAL</h3>
                      <p className="text-xs sm:text-sm text-pink-600">Crianças / Adolescentes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 hidden sm:flex"><Printer className="w-3.5 h-3.5" /> Imprimir</Button>
                    <Button variant="outline" size="icon" className="sm:hidden h-8 w-8"><Printer className="w-3.5 h-3.5" /></Button>
                    <button onClick={() => setFichaModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  {/* DADOS DO (A) MENOR */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Dados do (a) Menor</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <Input placeholder="Nome completo da criança/adolescente" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                        <Input placeholder="Ex: 8 anos" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ano Escolar</label>
                        <Input placeholder="Ex: 3º ano" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Turno</label>
                        <Input placeholder="Ex: ManhÁ, Tarde, Integral" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                        <Input placeholder="Nome da escola" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Professor(a)</label>
                        <Input placeholder="Nome do(a) professor(a)" />
                      </div>
                    </div>
                  </div>

                  {/* DADOS DOS RESPONSÁVEIS */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Dados dos Responsáveis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável 1</label>
                        <Input placeholder="Nome completo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
                        <Input placeholder="Ex: Mãe, Pai, Avó..." />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                        <Input placeholder="(00) 00000-0000" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável 2</label>
                        <Input placeholder="Nome completo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
                        <Input placeholder="Ex: Mãe, Pai, Avó..." />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                        <Input placeholder="(00) 00000-0000" />
                      </div>
                    </div>
                  </div>

                  {/* MOTIVO DA PROCURA */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Motivo da Procura</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">1) O que motivou vocês a buscar o atendimento? (queixa inicial)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">2) Quando essa questão surgiu? Acredita ter relação com algum evento?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">3) O que já tentaram fazer para lidar com essa questão?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">4) Já procuraram outros profissionais? Se sim, qual e o que foi feito?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">5) Faz uso de medicação? Se sim, qual?</label>
                        <Textarea rows={2} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* CONTEXTO FAMILIAR */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Contexto Familiar</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">6) Como está a rotina da família atualmente?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">7) Como é o comportamento do (a) menor em casa? Alguma situação preocupa?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">8) Tem outros filhos? Se sim, idades e como é a relação entre eles?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* ROTINA */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Rotina</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">9) Como é a rotina diária do (a) menor? (Sono, alimentação, horários, atividades extra)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">10) Como costuma ser o comportamento em tarefas escolares e dever de casa?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">11) Há diferença entre a rotina durante a semana e no fim de semana?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* ESCOLA E APRENDIZAGEM */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Escola e Aprendizagem</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">12) A escola já sinalizou alguma dificuldade ou comportamento? Se sim, qual?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">13) Como o (a) menor reage às atividades escolares? (Atenção, interesse, socialização)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* ASPECTOS EMOCIONAIS E COMPORTAMENTAIS */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Aspectos Emocionais e Comportamentais</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">14) Vocês percebem algum outro comportamento que chama atenção? (Medos, birras, ansiedade, agitação, isolamento, etc.)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">15) Como vocês costumam lidar com esses comportamentos?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* POTENCIALIDADES */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Potencialidades</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">16) Quais são as qualidades e pontos fortes do (a) menor?</label>
                      <Textarea rows={3} placeholder="" />
                    </div>
                  </div>

                  {/* EXPECTATIVAS */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Expectativas</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">17) O que vocês esperam do acompanhamento?</label>
                      <Textarea rows={3} placeholder="" />
                    </div>
                  </div>

                  {/* ASSINATURA */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                        <Input placeholder="São Paulo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                        <Input placeholder="Assinatura do responsável" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100">
                  <Button variant="outline" className="flex-1" onClick={() => setFichaModal(null)}>Cancelar</Button>
                  <Button className="flex-1 gap-1" onClick={saveFicha}><Save className="w-4 h-4" /> Salvar Ficha</Button>
                </div>
              </>
            )}

            {/* â”€â”€â”€ TRIAGEM ADULTOS â”€â”€â”€ */}
            {fichaModal === "triagem-adulto" && (
              <>
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">TRIAGEM INICIAL</h3>
                      <p className="text-xs sm:text-sm text-blue-600">Adultos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 hidden sm:flex"><Printer className="w-3.5 h-3.5" /> Imprimir</Button>
                    <Button variant="outline" size="icon" className="sm:hidden h-8 w-8"><Printer className="w-3.5 h-3.5" /></Button>
                    <button onClick={() => setFichaModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-6">
                  {/* DADOS DO PACIENTE */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Dados do Paciente</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <Input placeholder="Nome completo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                        <Input placeholder="Ex: 35 anos" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Escolaridade</label>
                        <Input placeholder="Ex: Ensino Superior Completo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profissão / Ocupação</label>
                        <Input placeholder="Ex: Professora, Engenheiro..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contato</label>
                        <Input placeholder="(00) 00000-0000" />
                      </div>
                    </div>
                  </div>

                  {/* MOTIVO DA PROCURA */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Motivo da Procura</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">1) O que motivou vocês a buscar o atendimento? (queixa inicial)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">2) Quando essa questão surgiu? Acredita ter relação com algum evento? (Escolar, profissional ou pessoal)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">3) O que você já tentou fazer para lidar com essa questão?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">4) Já procurou outros profissionais? Se sim, quais e qual foi a abordagem realizada?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">5) Faz uso de medicação? Se sim, qual?</label>
                        <Textarea rows={2} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* ROTINA ATUAL */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Rotina Atual</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">6) Como está SUA rotina atualmente? (trabalho, estudos, horários, organização do dia a dia)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">7) Como costuma ser a sua relação com tarefas que exigem atenção, concentração e organização?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">8) Há diferença entre sua rotina durante a semana e nos finais de semana?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* APRENDIZAGEM, ESTUDOS E TRABALHO */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Aprendizagem, Estudos e Trabalho</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">9) Você percebe dificuldades relacionadas à aprendizagem, memória, leitura e escrita, cálculos ou organização?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">10) Como você reage a situações de estudo, provas, cursos, treinamentos ou demandas profissionais?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">11) Já teve dificuldades escolares anteriormente (infância/adolescência)? Se sim, quais?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* ASPECTOS EMOCIONAIS E COMPORTAMENTAIS */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Aspectos Emocionais e Comportamentais</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">12) Percebe algum comportamento que chama sua atenção? (ansiedade, procrastinação, desorganização, bloqueios, insegurança, desmotivação, etc.)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">13) Como costuma lidar com essas situações?</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* POTENCIALIDADES */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Potencialidades</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">14) Quais você considera serem seus pontos fortes, habilidades e facilidades?</label>
                      <Textarea rows={3} placeholder="" />
                    </div>
                  </div>

                  {/* EXPECTATIVAS */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">Expectativas</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">15) O que você espera do acompanhamento?</label>
                      <Textarea rows={3} placeholder="" />
                    </div>
                  </div>

                  {/* ASSINATURA */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                        <Input placeholder="São Paulo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assinatura do (a) Paciente</label>
                        <Input placeholder="Assinatura do paciente" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100">
                  <Button variant="outline" className="flex-1" onClick={() => setFichaModal(null)}>Cancelar</Button>
                  <Button className="flex-1 gap-1" onClick={saveFicha}><Save className="w-4 h-4" /> Salvar Ficha</Button>
                </div>
              </>
            )}

            {/* â”€â”€â”€ ANAMNESE PSICOPEDAGOGIA - PSICOLÁ“GICA â”€â”€â”€ */}
            {fichaModal === "anamnese-psicopedagogia" && (
              <>
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-purple-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">FICHA DE ANAMNESE</h3>
                      <p className="text-xs sm:text-sm text-purple-600">Psicopedagogia - Psicológica</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 hidden sm:flex"><Printer className="w-3.5 h-3.5" /> Imprimir</Button>
                    <Button variant="outline" size="icon" className="sm:hidden h-8 w-8"><Printer className="w-3.5 h-3.5" /></Button>
                    <button onClick={() => setFichaModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-6">

                  {/* 1 â€“ IDENTIFICAÇÁO PACIENTE */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">1 â€“ Identificação Paciente</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <Input placeholder="Nome completo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                        <Input placeholder="Ex: 8 anos" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Escolaridade</label>
                        <Input placeholder="Ex: 3º ano" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
                        <Input placeholder="Nome da escola" />
                      </div>
                    </div>
                  </div>

                  {/* 2 â€“ IDENTIFICAÇÁO FAMÁLIA */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">2 â€“ Identificação Família</h4>
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Pai</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pai</label>
                        <Input placeholder="Nome completo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Natural de</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                        <Input placeholder="" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Mãe</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Mãe</label>
                        <Input placeholder="Nome completo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Natural de</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                        <Input placeholder="" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Outras pessoas com quem coabita</label>
                      <Input placeholder="" />
                    </div>
                  </div>

                  {/* 3 â€“ HISTÓRIA DO DESENVOLVIMENTO */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">3 â€“ História do Desenvolvimento</h4>

                    {/* 3.1 */}
                    <p className="text-xs font-bold text-gray-800 mb-3">3.1 â€“ História pré e perinatal</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condições da gestação</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferência de sexo</label>
                        <Input placeholder="" />
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Planejada</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Desejada</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prematuridade</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de gestações</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Abortos</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nados mortos</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Acidentes</label>
                        <Input placeholder="" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doenças da mãe durante a gestação</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tabaco</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Álcool</label>
                        <Input placeholder="" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Outros</label>
                        <Input placeholder="" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado emocional da mãe durante a gravidez</label>
                        <Textarea rows={2} placeholder="" />
                      </div>
                    </div>

                    {/* 3.2 */}
                    <p className="text-xs font-bold text-gray-800 mb-3 mt-6">3.2 â€“ Condições do parto</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duração do trabalho de parto</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alta ao fim de (dias)</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso (Kg)</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento (cm)</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Perímetro cefálico (cm)</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Índice APGAR 1º min</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">APGAR aos 5 min</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">APGAR aos 10 min</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ApresentaçÁo</label>
                        <Input placeholder="" />
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Eutócito</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Distócito</label>
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de parto:</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Cesariana</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Normal</label>
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Anestesia:</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Sim</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Não</label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Indicadores de lesão</label>
                        <Input placeholder="" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condições imediatas pós-parto</label>
                        <Textarea rows={2} placeholder="" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Problemas no nascimento</label>
                        <Textarea rows={2} placeholder="" />
                      </div>
                    </div>

                    {/* 3.3 */}
                    <p className="text-xs font-bold text-gray-800 mb-3 mt-6">3.3 â€“ Desenvolvimento motor e psicomotor</p>
                    <p className="text-xs text-gray-500 mb-2">Indique a idade e mês em que a criança atingiu cada marco:</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        "Mostrou resposta à mãe",
                        "Sentou-se independentemente",
                        "Engatinhou",
                        "Andou sozinho",
                        "Subiu escadas",
                        "Comeu com a colher/garfo",
                        "Bebeu por um copo",
                        "Despiu as meias",
                        "Vestiu camisolas",
                        "Abotoou o casaco",
                        "Pediu para ir à  casa de banho",
                        "Cuidou das suas necessidades",
                        "Preferiu a mão direita à esquerda",
                        "Vocalizou",
                        "Falou",
                        "Primeiras palavras",
                        "Palavra",
                        "Palavra frase",
                        "Frase",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <label className="block text-xs font-medium text-gray-700 min-w-[200px]">{item}</label>
                          <Input placeholder="Idade / mês" className="h-8 text-xs" />
                        </div>
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-gray-800 mb-2 mt-4">A criança habitualmente:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {[
                        "Usava as duas mãos indiscriminadamente",
                        "Caía frequentemente (equilíbrio)",
                        "Era descoordenada ou trapalhona",
                        "Teve dificuldades de deglutição",
                        "Apanhava objetos sem dificuldades",
                        "Imitava gestos simples",
                        "Imitava os outros",
                        "Utilizava formas particulares de organização motora (tiques)",
                        "Era criança apreensiva",
                        "Problemas de articulação",
                        "Problemas de linguagem",
                        "Problemas de comunicação",
                      ].map((item) => (
                        <label key={item} className="flex items-center gap-2 text-xs text-gray-700">
                          <input type="checkbox" className="rounded" />
                          {item}
                        </label>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vocabulário</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gago</label>
                        <Input placeholder="" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quais ainda persistem</label>
                        <Textarea rows={2} placeholder="" />
                      </div>
                    </div>

                    {/* 3.4 */}
                    <p className="text-xs font-bold text-gray-800 mb-3 mt-6">3.4 â€“ Desenvolvimento emocional</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      {[
                        "Reagiu favoravelmente às pessoas",
                        "Era distraída",
                        "Era calma",
                        "Era hiperativa",
                        "Era nervosa",
                        "Era sensível quando tocada e/ou movida",
                        "Brincava com crianças e adultos",
                        "Comia bem",
                        "Dormia bem",
                        "Expressava as suas necessidades",
                        "Tinha birras frequentes",
                        "Adaptava-se facilmente às situações em casa",
                        "Era exigente",
                        "Chorava frequentemente",
                        "Fazia amigos com facilidade",
                        "Mostrava-se condescendente quando separada dos pais",
                        "Mostrava-se contente",
                        "Alterava o comportamento na presença de estranhos",
                        "Fazia movimentos estereotipados e rítmicos",
                        "Reagiu favoravelmente a novidades",
                        "Procurava frequentemente a proteçÁo do adulto",
                      ].map((item) => (
                        <label key={item} className="flex items-center gap-2 text-xs text-gray-700">
                          <input type="checkbox" className="rounded" />
                          {item}
                        </label>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Atualmente algo a registar</label>
                      <Textarea rows={2} placeholder="" />
                    </div>
                  </div>

                  {/* 4 â€“ HISTÓRIA ESCOLAR */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">4 â€“ História Escolar</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nível de escolaridade atual</label>
                        <Input placeholder="" />
                      </div>
                      <div className="flex items-end gap-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pré-escolar:</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Sim</label>
                        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Não</label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conhecimento de alguma informação relevante relativa às vivências da criança até a entrada para o 1º ciclo do ensino Básico</label>
                        <Textarea rows={2} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Matriculado pela 1ª vez em</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Na escola</label>
                        <Input placeholder="" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Outras escolas que já frequentou</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nº de professores anteriores que o(a) aluno(a) teve</label>
                        <Input placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nº de anos de retenção do aluno</label>
                        <Input placeholder="" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assiduidade do(a) aluno(a)</label>
                        <Input placeholder="" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="col-span-2 flex items-center gap-4">
                        <label className="block text-sm font-medium text-gray-700">Atividades extra-curriculares: ateliê de tempos livres?</label>
                        <label className="flex items-center gap-1 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Sim</label>
                        <label className="flex items-center gap-1 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Não</label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Se sim, onde?</label>
                        <Input placeholder="" />
                      </div>
                      <div className="col-span-2 flex items-center gap-4">
                        <label className="block text-sm font-medium text-gray-700">Frequenta outras atividades extra-curriculares?</label>
                        <label className="flex items-center gap-1 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Sim</label>
                        <label className="flex items-center gap-1 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Não</label>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Se sim, quais?</label>
                        <Input placeholder="" />
                      </div>
                    </div>

                    <p className="text-xs font-bold text-gray-800 mb-3">Processos de ensino</p>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="block text-sm font-medium text-gray-700">As atividades na sala são realizadas com mais frequência em situação:</label>
                    </div>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Individual</label>
                      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Em pares</label>
                      <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded" /> Em grupo</label>
                    </div>
                  </div>

                  {/* 5 â€“ HISTÓRIA CLÍNICA */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">5 â€“ História Clínica</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Antecedentes de doenças da infância</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doenças familiares (Indicar a idade do início da doença)</label>
                        <Textarea rows={3} placeholder="" />
                      </div>
                    </div>
                  </div>

                  {/* 6 â€“ OBSERVAÇÁ•ES */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 border-b border-gray-200 pb-2">6 â€“ Observações</h4>
                    <Textarea rows={4} placeholder="" />
                  </div>

                </div>
                <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100">
                  <Button variant="outline" className="flex-1" onClick={() => setFichaModal(null)}>Cancelar</Button>
                  <Button className="flex-1 gap-1" onClick={saveFicha}><Save className="w-4 h-4" /> Salvar Ficha</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



