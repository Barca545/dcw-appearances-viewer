import { DisplayDensity, DisplayDirection, DisplayOptions, DisplayOrder } from "../../common/apiTypes";
import { InputChangeEventInput, InputChangeEventSelect } from "./types";
import { JSX } from "react";
import BooleanToggle from "./BooleanToggle";

export default function FilterBar({ opts }: { opts: DisplayOptions }): JSX.Element {
  // FIXME: Do these need trigger a rerender when they run? It is possible the main process-side state change in opt will not trigger a rerender

  // Filter change handlers
  // None of these dispatch because the status is updated elsewhere to preserve a single source of truth
  const handleOrderChange = (e: InputChangeEventSelect) => {
    window.API.displayOptions.requestOptionsUpdate({ ...opts, order: DisplayOrder.from(e.target.value).unwrap() });
  };
  const handleAscChange = (e: InputChangeEventInput) => {
    window.API.displayOptions.requestOptionsUpdate({ ...opts, dir: DisplayDirection.from(e.target.checked) });
  };
  const handleDensityChange = (e: InputChangeEventSelect) => {
    window.API.displayOptions.requestOptionsUpdate({ ...opts, density: DisplayDensity.from(e.target.value).unwrap() });
  };

  return (
    <form id="filter-options" onChange={(e) => {}}>
      <select name="sort-type" defaultValue={opts.order} id="sort-type" onChange={handleOrderChange}>
        <option value={DisplayOrder.PubDate}>Publication Date</option>
        <option value={DisplayOrder.AlphaNumeric}>A-Z</option>
      </select>
      <label htmlFor="input">Ascending</label>
      <BooleanToggle onChange={handleAscChange} checked={opts.dir == DisplayDirection.Ascending ? true : false} />
      <label>Density</label>
      <select name="density" onChange={handleDensityChange} defaultValue={opts.density}>
        <option value={DisplayDensity.Normal} label="Normal" />
        <option value={DisplayDensity.Dense}>Names Only</option>
      </select>
    </form>
  );
}
