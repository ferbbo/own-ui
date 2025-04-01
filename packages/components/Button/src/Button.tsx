import React from "react";

export interface ButtonProps {
  /**
   * Button contents
   */
  children: React.ReactNode;
  /**
   * Optional click handler
   */
  onClick?: () => void;
  /**
   * Button variant
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Button size
   */
  size?: "small" | "medium" | "large";
  /**
   * Is button disabled?
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  className = "",
  ...props
}: ButtonProps) => {
  // Base classes for all buttons
  const baseClasses =
    "font-sans rounded border-0 cursor-pointer inline-block leading-none transition-all duration-200";

  // Size classes
  const sizeClasses = {
    small: "text-xs py-2 px-3",
    medium: "text-sm py-3 px-4",
    large: "text-base py-4 px-6",
  }[size];

  // Variant classes
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "bg-secondary text-gray-800 hover:bg-secondary-hover",
    tertiary: "bg-tertiary-DEFAULT text-tertiary-text underline hover:text-tertiary-hover",
  }[variant];

  // Disabled classes
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:opacity-50" : "";

  // Combine all classes
  const buttonClasses =
    `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`.trim();

  return (
    <button className={buttonClasses} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
