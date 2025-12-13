// https://www.thisdot.co/blog/creating-custom-scrollbars-with-react

import { JSX, useCallback, useEffect, useRef, useState } from "react";

// https://stackblitz.com/edit/react-ts-frji5h?file=components%2Fscrollbar%2Findex.tsx\
/**A scrollbar replacement based on [Creating Custom Scrollbars with React](https://www.thisdot.co/blog/creating-custom-scrollbars-with-react). */
export default function HorizontalScrollBar({ contentRef }: HorizontalScrollBarProps): JSX.Element {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const observer = useRef<ResizeObserver | null>(null);

  const [thumbWidth, setThumbWidth] = useState(20);
  const [scrollStartPosition, setScrollStartPosition] = useState<number | null>(null);

  const [initialScrollLeft, setInitialScrollTop] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // TODO: I might be using spans or other containers so confirm this is correct
  const handleResize = (ref: HTMLElement, trackSize: number) => {
    const { clientWidth, scrollWidth } = ref;
    setThumbWidth(Math.max((clientWidth / scrollWidth) * trackSize, 20));
  };

  const handleScrollButton = (direction: "right" | "left") => {
    const { current } = contentRef;
    if (current) {
      const scrollAmount = direction === "left" ? 200 : -200;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleTrackClick = () =>
    useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const { current: trackCurrent } = scrollTrackRef;
        const { current: contentCurrent } = contentRef;
        if (trackCurrent && contentCurrent) {
          const { clientX } = e;
          const target = e.target as HTMLDivElement;
          const rect = target.getBoundingClientRect();
          const trackLeft = rect.left;
          const thumbOffset = -(thumbWidth / 2);
          const clickRatio = (clientX - trackLeft + thumbOffset) / trackCurrent.clientWidth;
          const scrollAmount = Math.floor(clickRatio * contentCurrent.scrollWidth);
          contentCurrent.scrollTo({ top: scrollAmount, behavior: "smooth" });
        }
      },
      [thumbWidth],
    );

  const handleThumbPosition = useCallback((e: Event) => {
    if (!contentRef.current || !scrollThumbRef.current || !scrollTrackRef.current) {
      return;
    }
    const { scrollLeft: contentLeft, scrollWidth: contentWidth } = contentRef.current;
    const { clientWidth: trackWidth } = scrollTrackRef.current;

    let newLeft = (+contentLeft / +contentWidth) * trackWidth;
    newLeft = Math.min(newLeft, trackWidth - thumbWidth);
    const thumb = scrollThumbRef.current;
    // TODO: What does this do?
    thumb.style.left = `${newLeft}px`;
  }, []);

  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setScrollStartPosition(e.clientX);
    if (contentRef.current) setInitialScrollTop(contentRef.current.scrollLeft);
    setIsDragging(true);
  }, []);

  const handleMouseThumbUp = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDragging) setIsDragging(false);
    },
    [isDragging],
  );

  const handleThumbMouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (contentRef.current && scrollStartPosition && isDragging) {
        const { scrollWidth: contentScrollWidth, offsetWidth: contentOffsetWidth } = contentRef.current;

        const deltaX = (e.clientX - scrollStartPosition) * (contentOffsetWidth / thumbWidth);
        const newScrollLeft = Math.min(initialScrollLeft + deltaX, contentScrollWidth - contentOffsetWidth);

        contentRef.current.scrollLeft = newScrollLeft;
      }
    },
    [isDragging, scrollStartPosition, thumbWidth],
  );

  // If the content and the scrollbar track exist,
  // use a ResizeObserver to adjust height of thumb and listen for scroll event to move the thumb
  useEffect(() => {
    if (contentRef.current && scrollTrackRef.current) {
      const ref = contentRef.current;
      const { clientWidth: trackSize } = scrollTrackRef.current;
      observer.current = new ResizeObserver(() => handleResize(ref, trackSize));
      ref.addEventListener("scroll", handleThumbPosition);
      return () => {
        observer.current?.unobserve(ref);
        ref.removeEventListener("scroll", handleThumbPosition);
      };
    }
  }, []);

  // Listen for mouse events to handle scrolling by dragging the thumb
  // TODO: Try and move these out of listeners and into the component itself
  useEffect(() => {
    // contentRef.current?.addEventListener("mousemove", (e) => handleThumbMouseMove(e));
    document.addEventListener("mousemove", handleThumbMouseMove);
    document.addEventListener("mouseup", handleMouseThumbUp);
    document.addEventListener("mouseleave", handleMouseThumbUp);
    return () => {
      document.removeEventListener("mousemove", handleThumbMouseMove);
      document.removeEventListener("mouseup", handleMouseThumbUp);
      document.removeEventListener("mouseleave", handleMouseThumbUp);
    };
  }, [handleThumbMouseMove, handleMouseThumbUp]);

  return (
    <div className="custom-scrollbar__scrollbar">
      <div className="custom-scrollbar__track-and-thumb">
        <div className="custom-scrollbar__track" ref={scrollTrackRef}></div>
        <div className="custom-scrollbar__thumb" ref={scrollThumbRef}></div>
      </div>
    </div>
  );
}

interface HorizontalScrollBarProps {
  contentRef: React.RefObject<HTMLElement | null>;
}
