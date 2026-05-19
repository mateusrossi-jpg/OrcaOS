import { useEffect } from 'react';

export function useAutoResizeTextArea(
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) {
  useEffect(() => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the content
      textAreaRef.style.height = '0px';
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, adding a bit of padding if needed
      textAreaRef.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
}
