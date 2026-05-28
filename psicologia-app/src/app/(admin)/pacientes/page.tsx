"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  Phone,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createPatient, getPatients, getPsychologists } from "@/lib/supabase/patients";
import { CreatePatientInput, Patient, Psychologist } from "@/lib/supabase/types";

const statusConfig = {
  ativo: { label: "Ativo", variant: "success" as const },
  inativo: { label: "Inativo", variant: "warning" as const },
  alta: { label: "Alta", variant: "default" as const },
};

const planConfig = {
  mensal: { label: "Mensal", variant: "default" as const },
  anual: { label: "Anual", variant: "success" as const },
  avulso: { label: "Avulso", variant: "secondary" as const },
};

const initialForm: CreatePatientInput = {
  name: "",
  cpf: "",
  birth_date: "",
  email: "",
  phone: "",
  gender: "",
  address: "",
  psychologist_id: "",
  plan: "mensal",
  emergency_contact: "",
  emergency_phone: "",
  status: "ativo",
};

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [form, setForm] = useState<CreatePatientInput>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [patientsData, psychologistsData] = await Promise.all([
        getPatients(),
        getPsychologists(),
      ]);
      setPatients(patientsData);
      setPsychologists(psychologistsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.email ?? "").toLowerCase().includes(term) ||
      (p.cpf ?? "").includes(searchTerm)
    );
  });

  const handleChange = (field: keyof CreatePatientInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Preencha pelo menos nome completo e telefone.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: CreatePatientInput = {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        cpf: form.cpf?.trim() || null,
        email: form.email?.trim() || null,
        birth_date: form.birth_date || null,
        gender: form.gender || null,
        address: form.address?.trim() || null,
        psychologist_id: form.psychologist_id || null,
        emergency_contact: form.emergency_contact?.trim() || null,
        emergency_phone: form.emergency_phone?.trim() || null,
        start_date: new Date().toISOString().split("T")[0],
      };

      const created = await createPatient(payload);
      setPatients((prev) => [created, ...prev]);
      setForm(initialForm);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar paciente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">Pacientes</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 leading-relaxed">
            Gerencie o cadastro dos seus pacientes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4" />
          Filtros
        </Button>
      </div>

      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Cadastro de Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome Completo *</label>
                <Input placeholder="Nome do paciente" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CPF</label>
                <Input placeholder="000.000.000-00" value={form.cpf ?? ""} onChange={(e) => handleChange("cpf", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de Nascimento</label>
                <Input type="date" value={form.birth_date ?? ""} onChange={(e) => handleChange("birth_date", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <Input type="email" placeholder="email@exemplo.com" value={form.email ?? ""} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone *</label>
                <Input placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gênero</label>
                <select value={form.gender ?? ""} onChange={(e) => handleChange("gender", e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Selecione</option>
                  <option>Masculino</option>
                  <option>Feminino</option>
                  <option>Não-binário</option>
                  <option>Prefere não informar</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereço</label>
                <Input placeholder="Rua, número, bairro - Cidade/UF" value={form.address ?? ""} onChange={(e) => handleChange("address", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Psicólogo(a) Responsável</label>
                <select value={form.psychologist_id ?? ""} onChange={(e) => handleChange("psychologist_id", e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Selecione</option>
                  {psychologists.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Plano</label>
                <select value={form.plan} onChange={(e) => handleChange("plan", e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                  <option value="avulso">Avulso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contato de Emergência</label>
                <Input placeholder="Nome do contato" value={form.emergency_contact ?? ""} onChange={(e) => handleChange("emergency_contact", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone Emergência</label>
                <Input placeholder="(00) 00000-0000" value={form.emergency_phone ?? ""} onChange={(e) => handleChange("emergency_phone", e.target.value)} />
              </div>
              <div className="col-span-full flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar Paciente"}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Paciente</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Contato</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Psicólogo(a)</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Plano</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Carregando pacientes...</td></tr>
                )}
                {!loading && filteredPatients.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Nenhum paciente cadastrado ainda.</td></tr>
                )}
                {!loading && filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500">CPF: {patient.cpf || "Não informado"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>
                        <span className="text-xs text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3" /> {patient.email || "Não informado"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{patient.psychologists?.name || "Não atribuído"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={planConfig[patient.plan].variant}>{planConfig[patient.plan].label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusConfig[patient.status].variant}>{statusConfig[patient.status].label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><FileText className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
