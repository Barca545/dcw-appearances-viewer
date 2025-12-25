import { useState, JSX } from "react";
import { SearchRequest } from "../../common/TypesAPI";
import { TabID } from "../../common/ipcAPI";

// TODO: The earths can be generated programatically by mapping a list. Either my handwritten one or the one pulled from the server
// TODO: Use optinistic can be used to set the loading state
const EARTHS = ["Prime Earth", "New Earth", "Earth-One", "Earth-Two"];

// TODO: The submit button can be a magnifying icon or gone entirely. ppl know what a search bar is

interface CharacterSearchFormProps {
  ID: TabID;
  setLoadState: (state: boolean) => void;
}

export default function CharacterSearchForm({ ID, setLoadState }: CharacterSearchFormProps): JSX.Element {
  const [name, setName] = useState("");
  const [earth, setEarth] = useState(`(${EARTHS[0]})`);

  const handleAction = (data: FormData) => {
    const req = {
      id: ID,
      character: data.get("character-name") as string,
      universe: data.get("character-universe") as string,
    } satisfies SearchRequest;

    // TODO: I still dislike that loadstate is being set here
    // Tell user a load is happening
    setLoadState(true);
    window.API.appTab.search(req);
  };

  return (
    <form className="CharacterSearchForm" action={handleAction}>
      <div className="search-field-wrapper">
        <label htmlFor="character-selection">Name</label>
        <input
          type="search"
          id="character-name"
          name="character-name"
          placeholder="Character Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          autoFocus
        />
      </div>
      <div className="search-field-wrapper">
        <EarthsList />
        <label htmlFor="earth">Earth</label>
        <input
          list="earths-list"
          id="earth"
          name="character-universe"
          defaultValue={earth}
          placeholder={earth}
          onChange={(e) => setEarth(e.currentTarget.value)}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

function EarthsList(): JSX.Element {
  return (
    <datalist id="earths-list">
      {EARTHS.map((earth) => {
        return (
          <option key={earth} value={`(${earth})`}>
            {earth}
          </option>
        );
      })}
    </datalist>
  );
}
