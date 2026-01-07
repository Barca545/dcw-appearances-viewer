import { PathLike } from "fs";

// TODO: Probably needs to be deleted if the sharp libary works

declare module "webp-converter" {
  export function grant_permission(): void;

  // TODO: This needs better typing look here to expand
  // node_modules\webp-converter\src\webpconverter.js
  // What does extra path do?
  /**Convert buffer to webp buffer.
   *
   * @param buffer Buffer
   * @param option Options and quality, it should be given between 0 to 100.
   */
  export async function buffer2webpbuffer(
    buffer: ArrayBuffer,
    image_type: string,
    option: string,
    extra_path?: PathLike,
  ): Promise<Buffer<ArrayBuffer>>;
}
