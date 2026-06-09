import { supabase } from "@/lib/supabase/client";
import { SessionRecording, CreateSessionRecordingInput } from "@/lib/supabase/types";

type DbRecording = {
  id: string;
  session_id: string | null;
  psychologist_id: string | null;
  patient_id: string | null;
  storage_path: string;
  public_url: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  mime_type: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

function mapRecording(r: DbRecording): SessionRecording {
  return {
    id: r.id,
    session_id: r.session_id,
    psychologist_id: r.psychologist_id,
    patient_id: r.patient_id,
    storage_path: r.storage_path,
    public_url: r.public_url,
    duration_seconds: r.duration_seconds,
    file_size_bytes: r.file_size_bytes,
    mime_type: r.mime_type,
    status: r.status as SessionRecording["status"],
    started_at: r.started_at,
    ended_at: r.ended_at,
    created_at: r.created_at,
  };
}

export async function createRecording(input: CreateSessionRecordingInput): Promise<SessionRecording> {
  const { data, error } = await supabase
    .from("session_recordings")
    .insert({
      session_id: input.session_id || null,
      psychologist_id: input.psychologist_id || null,
      patient_id: input.patient_id || null,
      storage_path: input.storage_path,
      public_url: input.public_url || null,
      duration_seconds: input.duration_seconds || null,
      file_size_bytes: input.file_size_bytes || null,
      mime_type: input.mime_type || "video/webm",
      status: input.status || "gravando",
      started_at: input.started_at || new Date().toISOString(),
      ended_at: input.ended_at || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapRecording(data as DbRecording);
}

export async function updateRecording(
  id: string,
  input: Partial<Omit<CreateSessionRecordingInput, "session_id" | "psychologist_id" | "patient_id">>
): Promise<SessionRecording> {
  const patch: Record<string, unknown> = {};
  if (input.storage_path !== undefined) patch.storage_path = input.storage_path;
  if (input.public_url !== undefined) patch.public_url = input.public_url;
  if (input.duration_seconds !== undefined) patch.duration_seconds = input.duration_seconds;
  if (input.file_size_bytes !== undefined) patch.file_size_bytes = input.file_size_bytes;
  if (input.mime_type !== undefined) patch.mime_type = input.mime_type;
  if (input.status !== undefined) patch.status = input.status;
  if (input.ended_at !== undefined) patch.ended_at = input.ended_at;
  const { data, error } = await supabase
    .from("session_recordings")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapRecording(data as DbRecording);
}

export async function getRecordingsBySession(sessionId: string): Promise<SessionRecording[]> {
  const { data, error } = await supabase
    .from("session_recordings")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbRecording[]).map(mapRecording);
}

export async function getAllRecordings(): Promise<SessionRecording[]> {
  const { data, error } = await supabase
    .from("session_recordings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbRecording[]).map(mapRecording);
}

export async function deleteRecording(id: string): Promise<void> {
  // Primeiro busca o registro para pegar o storage_path
  const { data: rec } = await supabase.from("session_recordings").select("storage_path").eq("id", id).single();
  if (rec?.storage_path) {
    await supabase.storage.from("session-recordings").remove([rec.storage_path]);
  }
  const { error } = await supabase.from("session_recordings").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Faz upload do blob de vídeo para o Supabase Storage.
 * Retorna o caminho do arquivo no storage.
 */
export async function uploadVideoBlob(
  blob: Blob,
  fileName: string
): Promise<{ path: string; publicUrl: string }> {
  const { data, error } = await supabase.storage
    .from("session-recordings")
    .upload(fileName, blob, {
      contentType: blob.type || "video/webm",
      upsert: false,
    });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from("session-recordings").getPublicUrl(data.path);
  return { path: data.path, publicUrl: urlData.publicUrl };
}
