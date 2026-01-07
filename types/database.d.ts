import { Database as GeneratedDatabase } from "database.types";
import { MergeDeep } from "type-fest";
import { LogFile, UserInfo } from "src/main/log";
import { UUID } from "node:crypto";

// https://supabase.com/docs/guides/api/rest/generating-types
export interface ErrorReport {
  error_id: UUID;
  title: string;
  error_start_time: string | null;
  description: string | null;
  logs: LogFile | null;
  user_info: UserInfo | null;
  screenshots: string[];
}

//supabase.com/docs/guides/api/rest/generating-types#defining-custom-json-types
https: export type Database = MergeDeep<
  GeneratedDatabase,
  {
    error_report_schema: {
      Tables: {
        user_error_reports: {
          Row: ErrorReport;
          Insert: ErrorReport;
          Update: ErrorReport;
          Relationships: [];
        };
      };
    };
  }
>;
