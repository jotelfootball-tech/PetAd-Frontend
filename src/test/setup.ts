import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// cleanup DOM after each test
afterEach(() => {
  cleanup();
});