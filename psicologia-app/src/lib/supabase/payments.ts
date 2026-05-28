import { supabase } from "@/lib/supabase/client";
import { CreatePaymentInput, Payment } from "@/lib/supabase/types";

export async function getPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("*, patients(id, name)")
    .order("due_date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((payment) => ({
    ...payment,
    amount: Number(payment.amount),
  })) as Payment[];
}

export async function createPayment(input: CreatePaymentInput) {
  const { data, error } = await supabase
    .from("payments")
    .insert(input)
    .select("*, patients(id, name)")
    .single();

  if (error) throw error;
  return { ...data, amount: Number(data.amount) } as Payment;
}
