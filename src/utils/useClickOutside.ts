import {RefObject, useCallback, useEffect} from "react";

const useClickOutside = <T extends HTMLElement>(
    ref: RefObject<T | null>,
    onClickOutside: () => void
  ) => {
  const handlePointerDown = useCallback((evt: PointerEvent) => {
    if (ref.current && !ref.current.contains(evt.target as Node)) {
      onClickOutside();
    }
  }, [ref]);

  useEffect(() => {
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
        document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onClickOutside, handlePointerDown]);
};

export default useClickOutside;
