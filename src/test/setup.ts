import "@testing-library/jest-dom";
import { server } from "../mocks/server";
import { cleanup } from "@testing-library/react";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.restoreAllMocks();
});
afterAll(() => server.close());
