import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 逐字打印 Hook
 * @param fullText 完整文本（为空时不启动打印）
 * @param speed 每个字的间隔 ms，默认 50
 * @returns { text, isTyping } 当前已打印的文本 + 是否正在打印
 */
export function useTypingEffect(fullText: string, speed: number = 50) {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!fullText) {
      setDisplayed('');
      setIsTyping(false);
      return;
    }

    setDisplayed('');
    indexRef.current = 0;
    setIsTyping(true);

    timerRef.current = window.setInterval(() => {
      indexRef.current++;
      if (indexRef.current <= fullText.length) {
        setDisplayed(fullText.slice(0, indexRef.current));
      } else {
        cleanup();
        setIsTyping(false);
      }
    }, speed);

    return cleanup;
  }, [fullText, speed, cleanup]);

  return { text: displayed, isTyping };
}
