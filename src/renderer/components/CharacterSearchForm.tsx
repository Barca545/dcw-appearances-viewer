import { Fragment, useState, JSX } from "react";
import { SearchRequest } from "../../common/TypesAPI";
import { TabID } from "../../common/ipcAPI";

// TODO: The earths can be generated programatically by mapping a list. Either my handwritten one or the one pulled from the server
// TODO: Use optinistic can be used to set the loading state
const EARTHS = ["Prime Earth", "New Earth", "Earth-One", "Earth-Two"];

interface CharacterSearchFormProps {
  ID: TabID;
  setLoadState: (state: boolean) => void;
}

export default function CharacterSearchForm({ ID, setLoadState }: CharacterSearchFormProps): JSX.Element {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const msg = new FormData(e.target as HTMLFormElement);
    const rawData = Object.fromEntries(msg.entries());
    const data = {
      id: ID,
      character: rawData["character-selection"] as unknown as string,
      universe: rawData["universe-select"] as unknown as string,
    } satisfies SearchRequest;

    // Tell user a load is happening
    setLoadState(true);
    window.API.tab.search(data);
  };

  return (
    <Fragment>
      <label htmlFor="character-selection">
        Get Appearances
        <form id="character-search-form" onSubmit={handleSubmit}>
          <input
            type="search"
            id="character-selection"
            name="character-selection"
            placeholder="Character Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <input list="earths-list" id="earth" name="universe-select" placeholder={`(${EARTHS[0]})`} />
          <EarthsList />
          <button type="submit">Submit</button>
        </form>
      </label>
    </Fragment>
  );
}

function EarthsList(): JSX.Element {
  const earths = EARTHS.map((earth) => {
    return (
      <option key={earth} value={`(${earth})`}>
        {earth}
      </option>
    );
  });

  return <datalist id="earths-list">{earths}</datalist>;
}
