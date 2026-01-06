import { Database as GeneratedDatabase } from "database.types";
import { MergeDeep } from "type-fest";

// https://supabase.com/docs/guides/api/rest/generating-types
export interface BackendErrorReport {
  title: string;
  error_start_time: string;
  userInfo: UserInfo | null;
  description: string;
  images: File[];
  logs: LogFile;
}

//supabase.com/docs/guides/api/rest/generating-types#defining-custom-json-types
https: export type Database = MergeDeep<GeneratedDatabase>;
