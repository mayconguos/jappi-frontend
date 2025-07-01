'use client';

import { useState, useEffect, useRef } from 'react';

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  initialState: boolean = false
) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    ref
  };
};
