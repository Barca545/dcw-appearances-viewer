import { Fragment, ReactNode } from "react";
// TODO:
// - This sends data
// - Updates the app to a loading state
// - Nothing else; the individual component will listen for the data response and handle reseting the loading state

// TODO: The earths can be generated programatically by mapping a list. Either my handwritten one or the one pulled from the server

const EARTHS = ["Prime Earth", "New Earth", "Earth-One", "Earth-Two"];

export default function CharacterSearchForm(): ReactNode {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const msg = new FormData(e.target as HTMLFormElement);
    const rawData = Object.fromEntries(msg.entries());
    const data = {
      character: rawData["character-selection"] as unknown as string,
      universe: rawData["universe-select"] as unknown as string,
    };

    document.getElementById("results-container")?.replaceChildren(...[]);
    // Tell user a load is happening
    setLoading(true);
    window.api.form
      .submit(data)
      .then(
        (res) => displayResults(res.appearances as AppearanceData[], res.character),
        (err: string) => displayError("Search Failed", err),
      )
      .finally(() => setLoading(false));
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

function EarthsList(): ReactNode {
  const earths = EARTHS.map((earth) => {
    return <option value={`(${earth})`}>{earth}</option>;
  });

  return <datalist id="earths-list">{earths}</datalist>;
}
