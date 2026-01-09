export interface AppMessages {
  unsavedChanges: string;
  unimplemented: string;
  illegalFileType: string;
  devContact: string;
}

export interface UserErrorInfo {
  title: string;
  error_start_time: string | null;
  description: string | null;
  email: string | null;
  submitUserInfo: boolean;
  images: IPCSafeFile[];
}

export interface IPCSafeFile {
  name: string;
  type: string;
  fileBits: ArrayBuffer;
}

export async function filesToIPCSafe(files: File[]): Promise<IPCSafeFile[]> {
  return Promise.all(
    files.map(async (file) => {
      return { fileBits: await file.arrayBuffer(), name: file.name, type: file.type };
    }),
  );
}
