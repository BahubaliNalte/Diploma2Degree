'use client';

import { useEffect } from 'react';

const DevToolsBlocker = () => {
  useEffect(() => {
    // 🔒 Disable right-click
    const disableContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', disableContextMenu);

    // 🔐 Block key combinations like F12, Ctrl+Shift+I, etc.
    const blockKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    document.addEventListener('keydown', blockKeys);

    // 🕵️ Detect DevTools by window size
    const detectDevTools = setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > 100 ||
        window.outerWidth - window.innerWidth > 100
      ) {
        document.body.innerHTML = '<h1>DevTools is not allowed!</h1>';
      }
    }, 1000);

    return () => {
      document.removeEventListener('contextmenu', disableContextMenu);
      document.removeEventListener('keydown', blockKeys);
      clearInterval(detectDevTools);
    };
  }, []);

  return null;
};

export default DevToolsBlocker;
