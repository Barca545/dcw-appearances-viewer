import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import FileInput from "./components/FileInput";

// TODO: This could arguably be a plain html page with no react

const root = createRoot(document.getElementById("root") as HTMLElement);

// TODO: It's possible this could be a ref instead of a state
const [images, setImages] = useState<File[]>([]);

const handleSubmit = (data: FormData) =>
  // TODO: Convert the images to webp / compress images

  window.ERROR.submit({
    title: data.get("title") as string,
    startTime: data.get("start-time") as string,
    description: data.get("description") as string,
    images,
  });

root.render(
  <React.StrictMode>
    <form className="error-report" action={handleSubmit}>
      <label className="error-report-field-title" htmlFor="title">
        <h1>Title</h1>
      </label>
      <input id="title" name="title" type="text" maxLength={20} autoFocus required />
      <label className="error-report-field-title" htmlFor="duration">
        How long has this been a problem?
      </label>
      <input type="date" id="start-time" />
      <label className="error-report-field-title" htmlFor="description">
        Description
      </label>
      {/* TODO: Add an onhover that clarifies what info */}
      <label htmlFor="privacy">Submit non-identifying user information?</label>
      <input type={"checkbox"} id="privacy" name="privacy" />
      <textarea
        id="description"
        name="description"
        spellCheck="true"
        wrap="soft"
        placeholder="Please enter a brief description of what caused the problem."
      />
      <FileInput accept="image/*" multiple />
      <button type="submit">Submit</button>
    </form>
  </React.StrictMode>,
);
