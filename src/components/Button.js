import React from "react";

export const Button = ({
  variant = "filled",
  onClick,
  className,
  children,
  disabled = false,
  style,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`button ${variant} ${
        disabled && "button-disabled"
      } ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};