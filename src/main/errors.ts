import { createClient } from "@supabase/supabase-js";
import { FileOptions } from "@supabase/storage-js/src/lib/types";
import { Database, BackendErrorReport } from "types/database";
import { dialog } from "electron";
import LOGGER, { LogFile, UserInfo } from "./log";
import webp from "webp-converter";

export interface UserErrorReport {
  title: string;
  error_start_time: string;
  description: string;
  images: File[];
}

// TODO: This cannot be uploaded
// http://127.0.0.1:54321/storage/v1/s3                             │
// │ Access Key │ 625729a08b95bf1b7ff351a663f3a23c                                 │
// │ Secret Key │ 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907 │
// │ Region     │ local

// Info submitted is non-identifying and will make it easier for the developer to diagnose problems. What info?

// TODO: Get logs cannot be a method on session it should be on logger

// TODO: Create INSERT RLS policy

// TODO: Should database types be in the types forder even tho its not a .d.ts

// TODO: Add image insertion support

// TODO: Create database types
// TODO: Make JSON fields more specific
// TODO: Delete accidental schema creation

// TODO: Provide users the option to not submit user info

const supabase = createClient<Database>("https://tjjtirdijggfqixxmueh.supabase.co", "publishable-or-anon-key");

function uploadErrorImage(reportID: BigUint64Array, images: File[]): string[] {
  let paths: string[] = [];
  images.forEach(async (img) => {
    // TODO: There might be a more efficient way to do this

    const buf = await webp.buffer2webpbuffer(await img.arrayBuffer(), img.type, "-q 70");
    // TODO: Unsure public is correct
    // TODO: I think name retains the extension but I really want it without the extension
    const path = `public/${reportID}/${img.name}.webp`;
    const opts: FileOptions = { contentType: "image/webp", upsert: false };
    const { data, error } = await supabase.storage.from("error_images").upload(path, buf, opts);
    if (error) {
      dialog.showMessageBoxSync({ message: `Error ${error.message}.\n Please try again` });
    }
    if (data) {
      paths.push(data.fullPath);
    }
  });

  return paths;
}

// This command generates types
// TODO: Add to package.json
// npx supabase gen types typescript --project-id "tjjtirdijggfqixxmueh" --schema error_report_schema > database.types.ts

// Create a single supabase client for interacting with your database
export async function uploadError({ title, error_start_time, description, userInfo, images }: BackendErrorReport) {
  const reportID = crypto.getRandomValues(new BigUint64Array());

  const imgPaths = uploadErrorImage(reportID, images);

  // TODO: Should I give them the option to attach logs from previous versions?
  // TODO: If so let them just select by version instead of in a file picker
  // Give the logger the ability to see which versions they have logs for
  const logs = LOGGER.versionLogs;

  const { error } = await supabase.from("user_error_reports").insert({
    title,
    error_start_time,
    description,
    userInfo,
    logs,
  });

  // TODO: Maybe return the error instead of handling it internally
  if (error) {
    // TODO: Add to messages JSON
    // How to store interpolatable strings in JSON
    dialog.showMessageBoxSync({ message: `Error ${error.message}.\n Please try again.` });
  } else {
    // TODO: Add to messages JSON
    dialog.showMessageBoxSync({ message: "Report Submitted Successfully" });
  }
}
