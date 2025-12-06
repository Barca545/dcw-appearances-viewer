import type { UUID } from "node:crypto";

export interface TabProps {
  selected: boolean;
  id: UUID;
  key: string;
  onSelect: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

// Hmmm tabs need to be client side tho...so actually this will require more work.
// do not do now
