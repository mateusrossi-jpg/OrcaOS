import { useLayoutEffect } from 'react';

export function useAutoResizeTextArea(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) {
      // Reset the height momentarily to auto to get the correct scrollHeight for the content
      el.style.height = 'auto';
      const scrollHeight = el.scrollHeight;

      // We then set the height directly, adding a bit of padding for borders
      if (scrollHeight > 0) {
        el.style.height = (scrollHeight + 2) + 'px';
      }
    }
  }, [ref, value]);
}
