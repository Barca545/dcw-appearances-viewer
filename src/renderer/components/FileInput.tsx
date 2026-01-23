// import webp from 'webp-converter';
import React, { JSX, useRef, useState } from "react";

// Built following these:
// - https://www.davebernhard.com/blog/pretty-file-upload-in-react
// - https://uploadcare.com/blog/how-to-upload-file-in-react/

interface FileInputProps {
  id?: string;
  name?: string;
  /**
   * Maximum size of files in the list in bytes.
   * Defaults to 200kb
   */
  maxSize?: number;
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
  accept,
  multiple = false,
  buttonText = "Upload file",
}: FileInputProps): JSX.Element {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    // This is needed otherwise it tries to submit
    e.preventDefault();
    uploadRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).map((file) => {
      if (accept && !new RegExp("image/*").test(file.type)) {
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
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        ref={uploadRef}
        onChange={handleChange}
        style={{ display: "none" }}
        multiple={multiple}
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
