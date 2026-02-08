import { JSX, Fragment, useEffect, useState } from "react";
import CharacterSearchForm from "./components/CharacterSearchForm";
import AppResults from "./components/AppResults";
import "./styles.css";
import "./app.css";
import { TabID } from "../common/ipcAPI";
import { SerializedAppTab } from "src/common/TypesAPI";
import { useParams } from "react-router";
import DisplayOptions from "./components/DisplayOptions";

// TODO: Solution to preserving searchbar state might just be to send it back to main
// TODO: This should be renamed from app and App should be what is currently in the index

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
        <DisplayOptions ID={ID} data={tabData} disabled={tabData.list.length <= 0} />
      </div>
      <AppResults ID={ID} data={tabData} isLoading={isPending} />
    </div>
  );
}
