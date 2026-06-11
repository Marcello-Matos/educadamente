"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  Trash2,
  Camera,
  X,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createPatient,
  deletePatient,
  getPatients,
  getPsychologists,
  updatePatient,
} from "@/lib/supabase/patients";
import { uploadProfilePhoto, updatePatientPhoto } from "@/lib/supabase/photos";
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

function patientToForm(patient: Patient): CreatePatientInput {
  return {
    name: patient.name,
    cpf: patient.cpf ?? "",
    birth_date: patient.birth_date ?? "",
    email: patient.email ?? "",
    phone: patient.phone,
    gender: patient.gender ?? "",
    address: patient.address ?? "",
    psychologist_id: patient.psychologist_id ?? "",
    plan: patient.plan,
    emergency_contact: patient.emergency_contact ?? "",
    emergency_phone: patient.emergency_phone ?? "",
    status: patient.status,
    start_date: patient.start_date,
    notes: patient.notes,
    diagnosis: patient.diagnosis,
    cid: patient.cid,
  };
}

function buildPatientPayload(form: CreatePatientInput, fallbackStartDate?: string | null): CreatePatientInput {
  return {
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
    start_date: fallbackStartDate || new Date().toISOString().split("T")[0],
  };
}

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [form, setForm] = useState<CreatePatientInput>(initialForm);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    } catch (err: any) {
      console.error("[Pacientes] Erro ao carregar:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timer);
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

  const handleNewPatient = () => {
    setForm(initialForm);
    setEditingPatient(null);
    setShowForm(true);
    setError(null);
  };

  const handleEditPatient = (patient: Patient) => {
    setForm(patientToForm(patient));
    setEditingPatient(patient);
    setShowForm(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setForm(initialForm);
    setEditingPatient(null);
    setShowForm(false);
    setError(null);
    removePhoto();
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

      const payload = buildPatientPayload(form, editingPatient?.start_date);

      if (editingPatient) {
        const updated = await updatePatient(editingPatient.id, payload);
        // Upload da foto se foi alterada
        if (photoFile) {
          try {
            setUploadingPhoto(true);
            const { url } = await uploadProfilePhoto(photoFile, updated.id);
            await updatePatientPhoto(updated.id, url);
            updated.photo_url = url;
          } catch (photoErr) {
            console.error("Erro ao fazer upload da foto:", photoErr);
          } finally {
            setUploadingPhoto(false);
          }
        }
        setPatients((prev) => prev.map((patient) => (patient.id === updated.id ? updated : patient)));
      } else {
        const created = await createPatient(payload);
        // Upload da foto se foi selecionada
        if (photoFile) {
          try {
            setUploadingPhoto(true);
            const { url } = await uploadProfilePhoto(photoFile, created.id);
            await updatePatientPhoto(created.id, url);
            created.photo_url = url;
          } catch (photoErr) {
            console.error("Erro ao fazer upload da foto:", photoErr);
          } finally {
            setUploadingPhoto(false);
          }
        }
        setPatients((prev) => [created, ...prev]);
      }

      setForm(initialForm);
      setEditingPatient(null);
      setShowForm(false);
      removePhoto();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar paciente");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!deletingPatient) return;

    try {
      setDeleting(true);
      setError(null);
      await deletePatient(deletingPatient.id);
      setPatients((prev) => prev.filter((patient) => patient.id !== deletingPatient.id));
      setDeletingPatient(null);

      if (editingPatient?.id === deletingPatient.id) {
        handleCancelForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir paciente");
    } finally {
      setDeleting(false);
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
        <Button onClick={handleNewPatient} className="w-full sm:w-auto">
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
            <CardTitle className="text-lg font-semibold tracking-tight">
              {editingPatient ? "Editar Paciente" : "Cadastro de Paciente"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto de Perfil</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                    {photoPreview || editingPatient?.photo_url ? (
                      <img src={photoPreview || editingPatient?.photo_url || ""} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                    {(photoPreview || editingPatient?.photo_url) && (
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
                      id="patient-photo-upload"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="patient-photo-upload"
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="alta">Alta</option>
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
              <div className="col-span-full flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" disabled={saving}>{saving ? "Salvando..." : editingPatient ? "Salvar Alterações" : "Salvar Paciente"}</Button>
                <Button type="button" variant="outline" onClick={handleCancelForm} disabled={saving}>Cancelar</Button>
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200 shrink-0">
                          {patient.photo_url ? (
                            <img src={patient.photo_url} alt={patient.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">CPF: {patient.cpf || "Não informado"}</p>
                        </div>
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
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Ver detalhes" onClick={() => setViewingPatient(patient)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Editar paciente" onClick={() => handleEditPatient(patient)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700" title="Excluir paciente" onClick={() => setDeletingPatient(patient)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!viewingPatient} onOpenChange={(open) => !open && setViewingPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingPatient?.name}</DialogTitle>
            <DialogDescription>Dados cadastrais do paciente</DialogDescription>
          </DialogHeader>
          {viewingPatient && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">CPF</p>
                <p className="text-gray-900">{viewingPatient.cpf || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Nascimento</p>
                <p className="text-gray-900">{viewingPatient.birth_date || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Telefone</p>
                <p className="text-gray-900">{viewingPatient.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Email</p>
                <p className="text-gray-900">{viewingPatient.email || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Psicólogo(a)</p>
                <p className="text-gray-900">{viewingPatient.psychologists?.name || "Não atribuído"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Plano e status</p>
                <div className="mt-1 flex gap-2">
                  <Badge variant={planConfig[viewingPatient.plan].variant}>{planConfig[viewingPatient.plan].label}</Badge>
                  <Badge variant={statusConfig[viewingPatient.status].variant}>{statusConfig[viewingPatient.status].label}</Badge>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-gray-500">Endereço</p>
                <p className="text-gray-900">{viewingPatient.address || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Contato de emergência</p>
                <p className="text-gray-900">{viewingPatient.emergency_contact || "Não informado"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Telefone emergência</p>
                <p className="text-gray-900">{viewingPatient.emergency_phone || "Não informado"}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewingPatient(null)}>Fechar</Button>
            {viewingPatient && (
              <Button type="button" onClick={() => {
                handleEditPatient(viewingPatient);
                setViewingPatient(null);
              }}>
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPatient} onOpenChange={(open) => !open && setDeletingPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir paciente</DialogTitle>
            <DialogDescription>
              Esta ação removerá o cadastro de {deletingPatient?.name}. Confirme apenas se deseja excluir este paciente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingPatient(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeletePatient} disabled={deleting}>
              {deleting ? "Excluindo..." : "Excluir Paciente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
