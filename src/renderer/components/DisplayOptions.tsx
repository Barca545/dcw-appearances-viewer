import { JSX } from "react";
import { DisplayOrder, DisplayDirection, DisplayDensity } from "../../common/apiTypes";
import { SerializedAppTab } from "../../common/TypesAPI";
import BooleanToggle from "./BooleanToggle";

interface DisplayOptionsProps {
  data: SerializedAppTab;
  disabled?: boolean;
}

export default function DisplayOptions({ data, disabled }: DisplayOptionsProps): JSX.Element {
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    window.API.appTab.setDisplayOptions({ ...data.opts, order: DisplayOrder.from(e.currentTarget.value).unwrap() });
  };
  const handleAscChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.currentTarget.checked);
    window.API.appTab.setDisplayOptions({ ...data.opts, dir: DisplayDirection.from(e.currentTarget.checked) });
  };
  const handleDensityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    window.API.appTab.setDisplayOptions({ ...data.opts, density: DisplayDensity.from(e.currentTarget.value).unwrap() });
  };

  let stylesheet: React.CSSProperties | undefined = undefined;
  if (disabled) {
    stylesheet = { pointerEvents: disabled ? "none" : "all", opacity: 0.5 };
  }

  return (
    <form id="filter-options" style={stylesheet}>
      <select name="sort-type" defaultValue={data.opts.order} id="sort-type" onChange={handleOrderChange}>
        <option value={DisplayOrder.PubDate}>Publication Date</option>
        <option value={DisplayOrder.AlphaNumeric}>A-Z</option>
      </select>
      <label htmlFor="input">Ascending</label>
      <BooleanToggle onChange={handleAscChange} checked={data.opts.dir == DisplayDirection.Ascending ? true : false} />
      <label>Density</label>
      <select name="density" onChange={handleDensityChange} defaultValue={data.opts.density}>
        <option value={DisplayDensity.Normal} label="Normal" />
        <option value={DisplayDensity.Dense}>Names Only</option>
      </select>
    </form>
  );
}
