import { JSX } from "react";
import { DisplayOrder, DisplayDirection, DisplayDensity } from "../../main/displayOptions";
import { SerializedAppTab } from "../../common/TypesAPI";
import BooleanToggle from "./BooleanToggle";
import type { TabID } from "src/common/ipcAPI";

interface DisplayOptionsProps {
  data: SerializedAppTab;
  ID: TabID;
  disabled?: boolean;
}

export default function DisplayOptions({ ID, data, disabled }: DisplayOptionsProps): JSX.Element {
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    window.API.appTab.setDisplayOptions(ID, { ...data.opts, order: DisplayOrder.from(e.currentTarget.value).unwrap() });
  };
  const handleAscChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    window.API.appTab.setDisplayOptions(ID, { ...data.opts, dir: DisplayDirection.from(e.currentTarget.checked) });

  const handleDensityChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    window.API.appTab.setDisplayOptions(ID, { ...data.opts, density: DisplayDensity.from(e.currentTarget.value).unwrap() });

  const handleShowDatesChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    window.API.appTab.setDisplayOptions(ID, { ...data.opts, showDates: e.currentTarget.checked });

  let stylesheet: React.CSSProperties = {};
  if (disabled) {
    stylesheet = { pointerEvents: disabled ? "none" : "all", opacity: 0.5 };
  }

  return (
    <form id="filter-options" style={stylesheet}>
      <select name="sort-type" defaultValue={data.opts.order} id="sort-type" onChange={handleOrderChange}>
        <option value={DisplayOrder.PubDate}>Publication Date</option>
        <option value={DisplayOrder.AlphaNumeric}>A-Z</option>
      </select>
      <label htmlFor="direction">Ascending</label>
      <BooleanToggle id="direction" onChange={handleAscChange} checked={data.opts.dir == DisplayDirection.Ascending ? true : false} />
      <label>Density</label>
      <select name="density" onChange={handleDensityChange} defaultValue={data.opts.density}>
        <option value={DisplayDensity.Normal} label="Normal" />
        <option value={DisplayDensity.Dense}>Names Only</option>
      </select>
      <label htmlFor="show-dates">Show Dates</label>
      <BooleanToggle id="show-dates" onChange={handleShowDatesChange} checked={data.opts.showDates} />
    </form>
  );
}
