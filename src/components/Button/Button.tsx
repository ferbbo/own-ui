import React from "react";
import styled from "@emotion/styled";

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
}

const StyledButton = styled.button<Omit<ButtonProps, "children">>`
  font-family: "Arial", sans-serif;
  border-radius: 4px;
  border: 0;
  cursor: pointer;
  display: inline-block;
  line-height: 1;
  transition: all 0.2s ease;

  /* Size styles */
  ${(props) => {
    switch (props.size) {
      case "small":
        return `
          font-size: 12px;
          padding: 8px 12px;
        `;
      case "large":
        return `
          font-size: 16px;
          padding: 16px 24px;
        `;
      default:
        return `
          font-size: 14px;
          padding: 12px 16px;
        `;
    }
  }}

  /* Variant styles */
  ${(props) => {
    switch (props.variant) {
      case "primary":
        return `
          background-color: #3366FF;
          color: white;
          &:hover {
            background-color: #254EDB;
          }
        `;
      case "secondary":
        return `
          background-color: #E0E0E0;
          color: #333333;
          &:hover {
            background-color: #CCCCCC;
          }
        `;
      case "tertiary":
        return `
          background-color: transparent;
          color: #3366FF;
          text-decoration: underline;
          &:hover {
            color: #254EDB;
          }
        `;
      default:
        return `
          background-color: #3366FF;
          color: white;
          &:hover {
            background-color: #254EDB;
          }
        `;
    }
  }}

  /* Disabled state */
  ${(props) =>
    props.disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      opacity: 0.5;
    }
  `}
`;

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  ...props
}: ButtonProps) => {
  return (
    <StyledButton variant={variant} size={size} disabled={disabled} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;
