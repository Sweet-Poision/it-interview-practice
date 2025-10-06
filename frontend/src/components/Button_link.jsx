import React, { useRef, useCallback } from "react";
import "./Button_link.css";

function Button_link({ children, href }) {
  const btnRef = useRef(null);
  const animationRef = useRef(null);
  const isHoveringRef = useRef(false);

  const handleMouseMove = useCallback((e) => {
    if (!isHoveringRef.current) return;

    // Cancel any pending animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Use requestAnimationFrame for smooth animation
    animationRef.current = requestAnimationFrame(() => {
      const btn = btnRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const moveX = (x - rect.width / 2) / 5;
      const moveY = (y - rect.height / 2) / 5;

      // Use transform3d for hardware acceleration and better Safari performance
      btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.1)`;
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveringRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;

    // Cancel any pending animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const btn = btnRef.current;
    if (btn) {
      // Use transform3d for consistency and hardware acceleration
      btn.style.transform = "translate3d(0px, 0px, 0) scale(1)";
    }
  }, []);

  return (
    <a
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="my-button-link"
      href={href}
    >
      {children}
    </a>
  );
}

export default Button_link;
