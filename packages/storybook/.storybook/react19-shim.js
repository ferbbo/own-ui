// React 19 compatibility shim for Storybook
import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

// Create a shim for unmountComponentAtNode which was removed in React 19
if (!ReactDOM.unmountComponentAtNode) {
  // Store a map of DOM nodes to their React roots
  const roots = new Map();

  // Create a shim for unmountComponentAtNode
  ReactDOM.unmountComponentAtNode = (container) => {
    const root = roots.get(container);
    if (root) {
      root.unmount();
      roots.delete(container);
      return true;
    }
    return false;
  };

  // Override render to use createRoot
  const originalRender = ReactDOM.render;
  ReactDOM.render = (element, container, callback) => {
    let root = roots.get(container);
    if (!root) {
      root = createRoot(container);
      roots.set(container, root);
    }
    root.render(element);
    if (callback) {
      callback();
    }
    return null;
  };
}

export default ReactDOM;
