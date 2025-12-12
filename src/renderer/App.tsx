import { JSX, Fragment } from "react";
import CharacterSearchForm from "./components/CharacterSearchForm.js";
import AppResults from "./components/AppResults.js";
import "./styles.css";
import { SerializedTabID } from "../common/ipcAPI.js";

// TODO: Figure out how to load an existing file.
// - Use context to store the file url? might get complicated once tabs are involved

interface AppTabProps {
  ID: SerializedTabID;
}

export default function App({ ID }: AppTabProps): JSX.Element {
  return (
    <Fragment>
      <CharacterSearchForm ID={ID} />
      <AppResults ID={ID} />
    </Fragment>
  );
}
