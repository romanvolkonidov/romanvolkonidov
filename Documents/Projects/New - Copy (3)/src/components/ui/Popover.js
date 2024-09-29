// Popover.js
import React, { useState, useRef, useEffect } from 'react';

export const PopoverTrigger = ({ onClick, children }) => (
  <button onClick={onClick} className="popover-trigger">
    {children}
  </button>
);

export const PopoverContent = ({ children, isOpen, onClose }) => {
  const popoverRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef, onClose]);

  return (
    isOpen && (
      <div className="popover-content" ref={popoverRef}>
        {children}
      </div>
    )
  );
};

const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopover = () => {
    setIsOpen((prev) => !prev);
  };

  const closePopover = () => {
    setIsOpen(false);
  };

  return (
    <div className="popover-container">
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, { togglePopover, isOpen, closePopover });
      })}
    </div>
  );
};

export default Popover;
