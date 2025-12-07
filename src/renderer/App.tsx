import { JSX, Fragment, useEffect } from "react";
import CharacterSearchForm from "./components/CharacterSearchForm.js";
import AppResults from "./components/AppResults.js";
import "./styles.css";
import { useAppDispatch } from "./store/hooks.js";
import { updateEntry } from "./store/listStateSlice.js";

// TODO: Figure out how to load an existing file.
// - Use context to store the file url? might get complicated once tabs are involved

export default function App(): JSX.Element {
  const dispatch = useAppDispatch();

  // TODO: This is not currently updating on receipt
  useEffect(() => {
    const unsubscribe = window.API.update.subscribe((data) => dispatch(updateEntry(data)));

    return unsubscribe;
  }, []);

  return (
    <Fragment>
      <CharacterSearchForm />
      <AppResults />
    </Fragment>
  );
}
