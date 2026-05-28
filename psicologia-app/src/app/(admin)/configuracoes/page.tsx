"use client";

import {
  Shield,
  Bell,
  Users,
  Lock,
  Database,
  Globe,
  Palette,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LGPD Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Privacidade & LGPD
            </CardTitle>
            <CardDescription>
              Configurações de conformidade com a Lei Geral de Proteção de Dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Criptografia de dados</p>
                <p className="text-xs text-gray-500">AES-256 para dados sensíveis</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Consentimento do paciente</p>
                <p className="text-xs text-gray-500">Termo de consentimento obrigatório</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Log de acessos</p>
                <p className="text-xs text-gray-500">Registro de quem acessou os dados</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Exclusão de dados</p>
                <p className="text-xs text-gray-500">Direito ao esquecimento</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure lembretes automáticos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Lembrete por WhatsApp</p>
                <p className="text-xs text-gray-500">24h antes da sessão</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Lembrete por Email</p>
                <p className="text-xs text-gray-500">48h antes da sessão</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Confirmação de consulta</p>
                <p className="text-xs text-gray-500">Solicitar confirmação do paciente</p>
              </div>
              <Badge variant="success">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">Alerta de inadimplência</p>
                <p className="text-xs text-gray-500">Notificar após 5 dias de atraso</p>
              </div>
              <Badge variant="warning">Configurar</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Equipe
            </CardTitle>
            <CardDescription>
              Gerencie psicólogos e secretárias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600">MS</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Dra. Maria Santos</p>
                  <p className="text-xs text-gray-500">Admin • CRP 06/123456</p>
                </div>
              </div>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600">JO</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Dr. João Oliveira</p>
                  <p className="text-xs text-gray-500">Psicólogo • CRP 06/654321</p>
                </div>
              </div>
              <Badge variant="success">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-amber-600">AC</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Dra. Ana Costa</p>
                  <p className="text-xs text-gray-500">Psicóloga • CRP 06/111222</p>
                </div>
              </div>
              <Badge variant="secondary">Offline</Badge>
            </div>
            <Button variant="outline" className="w-full mt-2" size="sm">
              Adicionar Membro
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tempo de sessão (minutos)
              </label>
              <Input type="number" defaultValue="30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Autenticação de dois fatores
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="success">Ativo</Badge>
                <span className="text-xs text-gray-500">Via SMS/Email</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Backup automático
              </label>
              <div className="flex items-center gap-2">
                <Badge variant="success">Diário</Badge>
                <span className="text-xs text-gray-500">Último: hoje às 03:00</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Database className="w-4 h-4" />
              Realizar Backup Manual
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
