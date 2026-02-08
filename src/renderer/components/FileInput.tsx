// import webp from 'webp-converter';
import React, { JSX, useRef, useState } from "react";

// Built following these:
// - https://www.davebernhard.com/blog/pretty-file-upload-in-react
// - https://uploadcare.com/blog/how-to-upload-file-in-react/

// TODO: Could use these for type verification:
// - https://github.com/sindresorhus/file-type
// - https://pye.hashnode.dev/how-to-validate-javascript-file-types-with-magic-bytes-and-mime-type

interface FileInputProps {
  id?: string;
  name?: string;
  /**
   * Maximum size of a file in the list in bytes.
   * Defaults to 200kb
   */
  maxSize?: number;
  /**
   * Maximum number of files a user can submit.
   * Defaults to 3. */
  maxNum?: number;
  /**Whether the file input allows the user to select more than one file. */
  multiple?: boolean;
  /**A comma-separated list of one or more [MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types) types, or unique file type specifiers, describing which file types to allow. */
  accept?: string;
  buttonText?: string;
  onFilesChange?: (files: File[]) => void;
}

// FIXME: This is checking the max size per packet not per each file
export default function FileInput({
  id,
  name,
  onFilesChange,
  maxSize = 200000,
  maxNum = 3,
  accept = "*/*",
  buttonText = "Upload file",
}: FileInputProps): JSX.Element {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    // This is needed otherwise it tries to submit
    e.preventDefault();

    if (files.length < maxNum) {
      uploadRef.current?.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Need to stop submissions when max number is hit.
    Array.from(e.target.files || []).map((file) => {
      if (wildCardMatching(file.type, accept)) {
        window.alert(`${file.name}, is unaccepted file type ${file.type}. Accepted file types: ${accept}`);
      } else if (file.size >= maxSize) {
        window.alert(`${file.name} is too large. Files must be ${bytesToReadable(maxSize)} or less.\n`);
      } else {
        // Slow but probably fine
        setFiles([...files, file]);
        if (onFilesChange) onFilesChange([...files, file]);
      }
    });
  };

  return (
    <div>
      {maxNum > 1 ? <>{`The maximum number of files allowed is ${maxNum}.`}</> : <></>}
      <br />
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        ref={uploadRef}
        onChange={handleChange}
        style={{ display: "none" }}
        multiple={maxNum > 1}
      />
      <button type="button" onClick={handleClick}>
        {buttonText}
      </button>
      <ul style={{ listStyleType: "none" }}>
        {files.map((file, idx) => (
          <li key={idx}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
}

// TODO: Needs a better description.
// TODO: Unclear this works

/**Converts bytes to the nearest readable units.
 *
 * Converts 1000+ bytes to Kb, 1000000+ bytes to Mb, and 1073741824+ bytes to GiB.
 */
function bytesToReadable(value: number): string {
  if (1000 <= value && value < 1000000) return `${value / 1000}Kb`;
  else if (1000000 <= value && value < 1073741824) return `${value / 1000000}Mb`;
  else return `${value / 1073741824}GiB`;
}

/**Confirms if text containing a wildcard matches a pattern.*/
// TODO: Rename
// TODO: Implement
function wildCardMatching(text, pattern): boolean {
  new RegExp(accept).test(file.type);
}
