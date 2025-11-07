import { useEffect } from 'react';

/**
 * Custom hook to detect clicks outside of a referenced element.
 * 
 * @param {React.RefObject} ref - The element reference to monitor.
 * @param {Function} onClickOutside - Callback triggered when user clicks outside the element.
 * @param {boolean} isActive - Optional flag to enable or disable the listener.
 */
export const useClickOutside = (ref, onClickOutside, isActive = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside?.(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, onClickOutside, isActive]);
};
