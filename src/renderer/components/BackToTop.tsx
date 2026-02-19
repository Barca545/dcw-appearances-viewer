import { CSSProperties, JSX, useEffect, useState } from "react";
import UpIcon from "./circle_up_arrow.svg?react";

interface BackToTopProps {
  showBelow?: number;
}

const BackToTopStyles: CSSProperties = {
  cursor: "pointer",
  position: "fixed",
  bottom: "2.75rem",
  right: "2.75rem",
  width: 55,
  height: 55,
};

export default function BackToTop({ showBelow = 20 }: BackToTopProps): JSX.Element | null {
  const [show, setShow] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, []);

  const checkScrollTop = () => setShow(window.scrollY > showBelow);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  // TODO: I am unsure if this will cause issues with mounting and remounting.
  // If it does, just use styling to hide the component.
  if (!show) return null;

  return (
    <div onClick={scrollTop} title="Back to Top" className="BackToTop" style={BackToTopStyles}>
      <UpIcon className="back_to_top_icon" />
    </div>
  );
}
