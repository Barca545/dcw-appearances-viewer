import { JSX, Fragment, useEffect, useState } from "react";
import CharacterSearchForm from "./components/CharacterSearchForm";
import AppResults from "./components/AppResults";
import "./styles.css";
import { TabID } from "../common/ipcAPI";
import LoadingSpinner from "./components/LoadingSpinner";
import { SerializedAppTab } from "src/common/TypesAPI";
import { useParams } from "react-router";

export default function App(): JSX.Element {
  const { ID } = useParams<Record<"ID", TabID>>();
  if (ID == undefined) {
    throw new Error("Tab must have an ID.");
  }

  const [tabData, setTabData] = useState<null | SerializedAppTab>(null);
  // Indicates whether a search is pending
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    window.API.appTab.request(ID).then((state) => setTabData(state));

    return window.API.appTab.onUpdate((state) => {
      if (state.meta.ID == ID) {
        setTabData(state as SerializedAppTab);
        setIsPending(false);
      }
    });
  }, []);

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
      <AppResults ID={ID} opts={tabData.opts} list={tabData.list} />
    </Fragment>
  );
}
