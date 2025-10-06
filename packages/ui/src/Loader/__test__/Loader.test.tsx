// Loader.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Loader from "../src/Loader";

describe("Loader", () => {
  test("renders with default props", () => {
    render(<Loader />);
    const loader = screen.getByRole("status");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute("aria-label", "Loading...");
    expect(loader).toHaveClass("loader", "loader-primary", "loader-md");
  });

  test("renders with custom size", () => {
    render(<Loader size="lg" />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveClass("loader-lg");
  });

  test("renders with custom color", () => {
    render(<Loader color="success" />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveClass("loader-success");
  });

  test("renders with custom aria-label", () => {
    render(<Loader aria-label="Guardando datos..." />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-label", "Guardando datos...");
  });

  test("renders with custom className", () => {
    render(<Loader className="custom-class" />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveClass("custom-class");
  });

  test("renders with different element as prop", () => {
    render(<Loader as="span" />);
    const loader = screen.getByRole("status");
    expect(loader.tagName).toBe("SPAN");
  });

  test("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Loader ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test("includes spinner element", () => {
    const { container } = render(<Loader />);
    const spinner = container.querySelector(".loader-spinner");
    expect(spinner).toBeInTheDocument();
  });

  test("has proper accessibility attributes", () => {
    render(<Loader />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-live", "polite");
    expect(loader).toHaveAttribute("role", "status");
  });
});
