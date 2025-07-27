import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// PortalMenu renders its children in a fixed position, outside the table
export default function PortalMenu({ anchorRect, open, children, onClose }) {
  const menuRef = useRef();

  useEffect(() => {
    if (!open) return;
    function handleClick(event) {
      // Only close if click outside the menu
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const style = {
    position: "fixed",
    top: anchorRect.bottom + 6,
    left: Math.max(anchorRect.right - 140, 16),
    zIndex: 15000,
    minWidth: 140,
  };

  return createPortal(
    <div
      className="action-menu"
      style={style}
      ref={menuRef}
      // הסר את onClick={e => e.stopPropagation()} כאן
    >
      {children}
    </div>,
    document.body
  );
}
