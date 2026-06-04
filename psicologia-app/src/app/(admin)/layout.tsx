import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ToastContainer } from "@/components/ui/toast";
import { Onboarding } from "@/components/ui/onboarding";
import { RequireAuth } from "@/components/auth/require-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 lg:ml-64 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">{children}</main>
        </div>
        <ToastContainer />
        <Onboarding />
      </div>
    </RequireAuth>
  );
}
