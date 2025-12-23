import React from "react";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root") as HTMLElement);

const handleSubmit = (data: FormData) =>
  window.ERROR.submit({
    title: data.get("title") as string,
    startTime: data.get("start-time") as string,
    description: data.get("description") as string,
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
      <textarea
        id="description"
        name="description"
        spellCheck="true"
        wrap="soft"
        placeholder="Please enter a brief description of what caused the problem."
      />
      <button type="submit">Submit</button>
    </form>
  </React.StrictMode>,
);
