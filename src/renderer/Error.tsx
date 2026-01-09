import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import FileInput from "./components/FileInput";
import ToolTip, { Orientation } from "./components/ToolTip";
import BooleanToggle from "./components/BooleanToggle";
import "./stylesheets/ErrorReportForm.css";
import { filesToIPCSafe } from "../common/apiTypes";

// TODO: Why does this start so far down on the page?

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <ErrorReportForm />
  </React.StrictMode>,
);

function ErrorReportForm() {
  const [images, setImages] = useState<File[]>([]);

  // TODO: Don't clear on submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);

    window.ERROR.submit({
      title: data.get("title") as string,
      error_start_time: (data.get("error_start_time") as string) || null,
      description: (data.get("description") as string) || null,
      email: (data.get("email") as string) || null,
      submitUserInfo: Boolean(data.get("submit-user-info")),
      images: await filesToIPCSafe(images),
    });
  };

  const dataDisclaimer =
    "Choosing to share diagnostic data in your error report will share non-identifying information about your operating system and CPU with the developer.";

  return (
    <form className="error-report" onSubmit={handleSubmit}>
      <fieldset className="error-report-field">
        <label className="error-report-field-title" htmlFor="title">
          Title
        </label>
        <input id="title" name="title" type="text" maxLength={50} autoFocus required />
      </fieldset>
      <fieldset className="error-report-field">
        <label className="error-report-field-title" htmlFor="email">
          Email
        </label>
        Include your email if you would like to be contacted when the error is resolved or for further information.
        <input type="email" id="email" name="email" />
      </fieldset>
      <fieldset className="error-report-field">
        <label className="error-report-field-title" htmlFor="error_start_time">
          When did you first identify this issue?
        </label>
        <input type="date" id="error_start_time" name="error_start_time" />
      </fieldset>
      <fieldset className="error-report-field">
        <label className="error-report-field-title" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          spellCheck="true"
          wrap="soft"
          placeholder="Please enter a brief description of what caused the problem."
        />
      </fieldset>
      <fieldset className="error-report-field">
        <label htmlFor="privacy" className="error-report-field-title">
          Diagnostic data
        </label>
        <span style={{ textAlign: "center" }}>
          <ToolTip value={dataDisclaimer} orientation={Orientation.Left} style={{ width: "16rem" }}>
            What's shared?
          </ToolTip>
        </span>
        <BooleanToggle id="submit-user-info" name="submit-user-info" />
      </fieldset>
      <fieldset className="error-report-field">
        <label htmlFor="screenshot-upload" className="error-report-field-title">
          Screenshots
        </label>
        <span>Share screenshots of the problem if relevant.</span>
        <FileInput id="screenshot-upload" name="screenshot-upload" accept="image/*" onFilesChange={(files) => setImages(files)} multiple />
      </fieldset>
      <button type="submit">Submit</button>
    </form>
  );
}
