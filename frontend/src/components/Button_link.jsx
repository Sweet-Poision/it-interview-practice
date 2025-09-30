import React, { useRef } from "react";
import "./Button_link.css";

function Button_link({ children, href }) {
  const btnRef = useRef(null);
  const handleMouseMove = (e) => {
    const btn = btnRef.current;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const moveX = (x - rect.width / 2) / 5;
    const moveY = (y - rect.height / 2) / 5;

    btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    btn.style.transform = "translate(0px, 0px) scale(1)";
  };
  return (
    <a
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="my-button-link"
      href={href}
    >
      {children}
    </a>
  );
}

export default Button_link;
