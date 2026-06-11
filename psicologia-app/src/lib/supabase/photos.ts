import { supabase } from "@/lib/supabase/client";

const BUCKET_NAME = "user-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadPhotoResult {
  url: string;
  path: string;
}

/**
 * Faz upload de uma foto de perfil para o bucket user-photos
 * @param file Arquivo da foto
 * @param userId ID do usuário (para nomear o arquivo)
 * @returns URL pública da foto
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<UploadPhotoResult> {
  // Validações
  if (!file) {
    throw new Error("Nenhum arquivo selecionado");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A foto deve ter no máximo 5MB");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato não suportado. Use JPEG, PNG, WebP ou GIF");
  }

  // Extrair extensão do arquivo
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  // Upload para o Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  // Obter URL pública
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
  };
}

/**
 * Remove uma foto de perfil do bucket
 * @param path Caminho do arquivo no storage
 */
export async function deleteProfilePhoto(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Erro ao remover foto: ${error.message}`);
  }
}

/**
 * Atualiza a photo_url de um psicólogo
 * @param psychologistId ID do psicólogo
 * @param photoUrl URL da foto
 */
export async function updatePsychologistPhoto(
  psychologistId: string,
  photoUrl: string
): Promise<void> {
  const { error } = await supabase
    .from("psychologists")
    .update({ photo_url: photoUrl })
    .eq("id", psychologistId);

  if (error) {
    throw new Error(`Erro ao atualizar foto do psicólogo: ${error.message}`);
  }
}

/**
 * Atualiza a photo_url de um paciente
 * @param patientId ID do paciente
 * @param photoUrl URL da foto
 */
export async function updatePatientPhoto(
  patientId: string,
  photoUrl: string
): Promise<void> {
  const { error } = await supabase
    .from("patients")
    .update({ photo_url: photoUrl })
    .eq("id", patientId);

  if (error) {
    throw new Error(`Erro ao atualizar foto do paciente: ${error.message}`);
  }
}

/**
 * Atualiza a photo_url de um usuário do sistema
 * @param userId ID do usuário
 * @param photoUrl URL da foto
 */
export async function updateSystemUserPhoto(
  userId: string,
  photoUrl: string
): Promise<void> {
  const { error } = await supabase
    .from("system_users")
    .update({ photo_url: photoUrl })
    .eq("id", userId);

  if (error) {
    throw new Error(`Erro ao atualizar foto do usuário: ${error.message}`);
  }
}
