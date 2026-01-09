import { createClient } from "@supabase/supabase-js";
import { FileOptions } from "@supabase/storage-js/src/lib/types";
import { Database } from "types/database";
import { dialog } from "electron";
import LOGGER, { UserInfo } from "./log";
// import sharp from "sharp";
import crypto, { UUID } from "node:crypto";
import path from "path";
import { IPCSafeFile, UserErrorInfo } from "src/common/apiTypes";

// TODO: Create INSERT RLS policy

// TODO: Where should I store the database.types.ts file

// TODO: Delete accidental local schema creation?

// TODO: Should I give them the option to attach logs from previous versions?
// TODO: If so let them just select by version instead of in a file picker

// TODO: Confirm the image paths worked

// TODO: Temporarily store the error report and images in a zip folder
// in case the error report fails to go through.
// - This only really makes sense if I have a way to contact them for more information
// - Should I add a way to contact them for more information?

// TODO: Give error reports a recieved timestamp serverside to allow sorting by most recent

// TODO: Store image at their full URL to make clicking to them easier?
// - Tho I would need to make those URLs accessable easily.
// - I don't want to always have to go through the dashboard.
// - I suppose I could just write a script that pulls based on the error ID and makes a zip folder.

// TODO: Clicking "ok" should close the file

// Create a single supabase client for interacting with database
const supabase = createClient<Database, "error_report_schema">(
  "https://tjjtirdijggfqixxmueh.supabase.co",
  "sb_publishable_FDs8Wr7Dk9x3iveVBEfHrg_PAmpYMpo",
  {
    db: { schema: "error_report_schema" },
  },
);

// TODO: This might be necessary
// const { data, error } = await supabase.auth.signInAnonymously();

type ImageUploadResult = {
  /**The url paths of the uploads that succeeded. */
  uploaded: string[];
  /**The indicies of the uploads that failed. */
  failed: number[];
};

async function uploadErrorImage(reportID: UUID, images: IPCSafeFile[]): Promise<ImageUploadResult> {
  const failed: number[] = [];

  const uploaded: string[] = [];

  for (const idx in images) {
    const img = images[idx];
    // FIXME: Sharp is annoying to package
    // const buf = await sharp(img.fileBits).webp({ quality: 70 }).toBuffer();
    // const serverPath = `${reportID}/${path.basename(img.name, path.extname(img.name)).replace(/\s+/g, "_")}.webp`;

    const serverPath = `${reportID}/${path.basename(img.name).replace(/\s+/g, "_")}`;
    const opts: FileOptions = { contentType: "image/webp", upsert: false };
    const { data, error } = await supabase.storage.from("error-reports").upload(serverPath, img.fileBits, opts);

    if (error) {
      failed.push(parseInt(idx));
    } else {
      uploaded.push(data.fullPath);
    }
  }

  return { uploaded, failed };
}

// Delete uploaded images if an error report fails
async function cleanUploadedImages(reportID: UUID, images: IPCSafeFile[]) {
  if (images.length === 0) return;

  const paths = await Promise.all(
    await images.map(async (img) => {
      const imgExt = path.extname(img.name);
      return `${reportID}/${path.basename(img.name, imgExt).replace(/\s+/g, "_")}.webp`;
    }),
  );
  await supabase.storage.from("error-reports").remove(paths);
}

export async function uploadError({ title, email, error_start_time, description, submitUserInfo, images }: UserErrorInfo) {
  const error_id = crypto.randomUUID();

  let screenshots: string[] | null = null;

  if (images.length > 0) {
    const { uploaded } = await uploadErrorImage(error_id, images);
    screenshots = uploaded;
  }

  let user_info: UserInfo | null = null;

  if (submitUserInfo) {
    user_info = await UserInfo.create();
  }

  const logs = LOGGER.versionLogs;

  const { error } = await supabase
    .from("user_error_reports")
    .insert({ error_id, title, error_start_time, description, email, user_info, logs, screenshots });

  // Handle ID collision (extremely unlikely)
  if (error?.message?.includes("duplicate key") || error?.code === "23505") {
    // Handle collision by calling recursively for now
    // This is a rare enough concern there is basically 0 chance this is an error
    cleanUploadedImages(error_id, images);
    uploadError({ title, email, error_start_time, description, submitUserInfo, images });
  } else if (error) {
    // TODO: Add to messages JSON
    // TODO: How to store interpolatable strings in JSON
    dialog.showMessageBoxSync({ message: `Error ${error.message}.\n Please try again.` });
  } else {
    // TODO: Add to messages JSON
    dialog.showMessageBoxSync({ message: "Report Submitted Successfully.\n" });
  }
}

// TODO: Switch to using edge function so requests can be bundled
// On the other hand using an edge function doesn't really bundle it just pushes the pain point later
// async function serializeImage(images: IPCSafeFile): Promise<IPCSafeFile> {}
// TODO: These will now be server side in the edge function
// const opts: FileOptions = { contentType: "image/webp", upsert: false };
// const { data, error } = await supabase.storage.from("error-reports").upload(serverPath, buf, opts);

// interface SerializedImage {
//   name: string;
//   type: string;
//   fileBits: Uint8Array;
// }
