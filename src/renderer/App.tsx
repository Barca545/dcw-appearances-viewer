import { JSX, Fragment, useEffect, useState } from "react";
import CharacterSearchForm from "./components/CharacterSearchForm";
import AppResults from "./components/AppResults";
import "./styles.css";
import { TabID } from "../common/ipcAPI";
import { SerializedAppTab } from "src/common/TypesAPI";
import { useParams } from "react-router";
import DisplayOptions from "./components/DisplayOptions";

// FIXME: Searchbar issues
// - Search bar does not set isloading to false when it is done loading
// - Search bar does not pass the result of its search up to its parent
// - SearchBar Rerenders. It should basically never do that

// Solution to preserving state might just be to send it back to main

export default function App(): JSX.Element {
  const { ID } = useParams<Record<"ID", TabID>>();
  if (ID == undefined) {
    throw new Error("Tab must have an ID.");
  }

  const [tabData, setTabData] = useState<null | SerializedAppTab>(null);
  // Indicates whether a search is pending
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    window.API.appTab.request(ID).then((state) => setTabData(state));

    return window.API.appTab.onUpdate((state) => {
      if (state.meta.ID == ID) {
        setTabData(state as SerializedAppTab);
        setIsPending(false);
      }
    });
  }, [ID]);

  // TODO: This should be centered in the middle of the field
  if (!tabData) {
    return <Fragment />;
  }

  return (
    <div className={"app-container"}>
      <div className="search-bar">
        <CharacterSearchForm ID={ID} setLoadState={setIsPending} />
      </div>
      <div>
        <DisplayOptions data={tabData} disabled={tabData.list.length < 0} />
      </div>
      <AppResults ID={ID} data={tabData} isLoading={isPending} />
    </div>
  );
}
