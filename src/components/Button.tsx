import React, { PropsWithChildren } from "react";

const BUTTON_CLASSNAME = "bg-emerald-500 text-white h-10 p-2 border-2 !m-0 !rounded-lg " +
  "disabled:bg-gray-300";

export interface ButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const Button = ({
  children,
  className,
  disabled,
  onClick,
}: PropsWithChildren<ButtonProps>) => (
  <button className={`${BUTTON_CLASSNAME} ${className || ''}`} disabled={!!disabled}
          onClick={onClick}>
    {children}
  </button>
);

export default Button;
