import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import FileInput from "./components/FileInput";
import ToolTip, { Orientation } from "./components/ToolTip";
import BooleanToggle from "./components/BooleanToggle";
import "./stylesheets/ErrorReportForm.css";
import { filesToIPCSafe } from "../common/apiTypes";
import * as Sentry from "@sentry/electron/renderer";
import { Attachment } from "@sentry/core/build/types/types-hoist/attachment";
import { init as reactInit } from "@sentry/react";

// TODO: Why does this start so far down on the page?
Sentry.init(
  {
    debug: true,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/electron/configuration/options/#sendDefaultPii
    // sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      // Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        autoInject: false,
        // Additional SDK configuration goes in here, for example:
        colorScheme: "system",
        // Disable the injection of the default widget
        // isNameRequired: true,
        // isEmailRequired: true,
        // enableScreenshot: true,
      }),
    ],
    // TODO: These are probably unnecessary,
    // these are for capturing the cause of an error
    // but feedback is not an error per se
    // _________________________________________________
    // replaysSessionSampleRate: 0.1,
    // replaysOnErrorSampleRate: 1.0,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    // Learn more at
    // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
    tracesSampleRate: 1.0,
  },
  reactInit,
);

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
    const data = new FormData(e.currentTarget as HTMLFormElement);

    // TODO: Get the attachment(s)
    const feedback = {
      // name: String(data.get("name")),
      title: data.get("title") as string,
      email: String(data.get("email")),
      message: String(data.get("message")),
    };

    Sentry.captureFeedback(
      // TODO: How do I add fields?
      feedback,
      {
        includeReplay: false,
        attachments: images.map((file) => fileToAttachment(file)),
      },
    );

    // TODO: Experiment with this vs capture to see if one provides receipt
    // Sentry.sendFeedback(feedback);

    // window.ERROR.submit({
    //   title: data.get("title") as string,
    //   error_start_time: (data.get("error_start_time") as string) || null,
    //   message: (data.get("message") as string) || null,
    //   email: (data.get("email") as string) || null,
    //   submitUserInfo: Boolean(data.get("submit-user-info")),
    //   images: await filesToIPCSafe(images),
    // });

    // TODO: Should there be a dialog here to confirm submission?
    // Briefly display a banner at the top of the parent app window
    alert("Thank you for submitting!");

    // TODO: Close the window once the user dismisses it?
    window.ERROR.close();
  };

  const handleCancel = () => window.ERROR.close();

  const dataDisclaimer =
    "Choosing to share diagnostic data in your error report will share non-identifying information about your operating system and CPU with the developer.";

  return (
    <form className="error-report" onSubmit={handleSubmit}>
      <fieldset className="error-report-field">
        <label className="error-report-field-title" htmlFor="email">
          Email
        </label>
        Include your email if you would like to be contacted when the error is resolved or for further information.
        <input type="email" id="email" name="email" />
      </fieldset>
      <fieldset className="error-report-field">
        <label className="error-report-field-title" htmlFor="message">
          Description*
        </label>
        <textarea
          id="message"
          name="message"
          spellCheck="true"
          wrap="soft"
          placeholder="Please enter a brief description of what caused the problem."
          required
          autoFocus
        />
      </fieldset>
      {
        // TODO: Delete this if Sentry works out
        /* <fieldset className="error-report-field">
        <label htmlFor="privacy" className="error-report-field-title">
          Diagnostic data
        </label>
        <span style={{ textAlign: "center" }}>
          <ToolTip value={dataDisclaimer} orientation={Orientation.Left} style={{ width: "16rem" }}>
            What's shared?
          </ToolTip>
        </span>
        <BooleanToggle id="submit-user-info" name="submit-user-info" />
      </fieldset> */
      }
      <fieldset className="error-report-field">
        <label htmlFor="screenshot-upload" className="error-report-field-title">
          Screenshots
        </label>
        <span>Share screenshots of the problem if relevant.</span>
        <FileInput id="screenshot-upload" name="screenshot-upload" accept="image/*" onFilesChange={(files) => setImages(files)} />
      </fieldset>
      <fieldset>
        <button type="submit">Submit</button>
        <button onClick={handleCancel}>Cancel</button>
      </fieldset>
    </form>
  );
}

async function fileToAttachment(file: File) {
  // TODO: Maybe I can use this in my component
  const data = new Uint8Array(await file.arrayBuffer());
  const attachmentData = {
    data,
    filename: file.name, // Or pass attachmentField.name,
    // No need to set `contentType` because it's encoded in the `data` array
  };
  return attachmentData;
}
