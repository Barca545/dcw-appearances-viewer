import { JSX, Fragment, useEffect, useState } from "react";
import CharacterSearchForm from "./components/CharacterSearchForm.js";
import AppResults from "./components/AppResults.js";
import "./styles.css";
import { TabID } from "../common/ipcAPI.js";
import FilterBar from "./components/FilterBar.js";
import LoadingSpinner from "./components/LoadingSpinner.js";
import { SerializedAppTab } from "src/common/TypesAPI.js";

// TODO: Figure out how to load an existing file.
// - Use context to store the file url? might get complicated once tabs are involved

interface AppTabProps {
  ID: TabID;
}

export default function App({ ID }: AppTabProps): JSX.Element {
  const [tabData, setTabData] = useState<null | SerializedAppTab>(null);
  // Indicates whether a search is pending
  const [isPending, setIsPending] = useState(false);

  // First time it loads, get the data from the main process
  // FIXME: I think technically this causes a bunch of memory leaks because it never deregisters the listeners
  useEffect(() => {
    window.API.tab.requestTabState().then((state) => setTabData(state as SerializedAppTab));
  }, []);

  useEffect(
    () =>
      window.API.tab.update((state) => {
        setTabData(state as SerializedAppTab);
        setIsPending(false);
      }),
    [],
  );

  // TODO: This should be centered in the middle of the field
  if (!tabData) {
    return <CharacterSearchForm ID={ID} setLoadState={setIsPending} />;
  } else if (isPending) {
    <Fragment>
      <CharacterSearchForm ID={ID} setLoadState={setIsPending} />
      <LoadingSpinner />
    </Fragment>;
  }

  return (
    <Fragment>
      <CharacterSearchForm ID={ID} setLoadState={setIsPending} />
      <FilterBar opts={tabData.opts} />
      <AppResults ID={ID} density={tabData.opts.density} list={tabData.list} />
    </Fragment>
  );
}
