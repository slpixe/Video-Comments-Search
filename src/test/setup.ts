import "@testing-library/jest-dom";
import { server } from "../mocks/server";
import { cleanup } from "@testing-library/react";

beforeEach(() => vi.stubEnv('VITE_YOUTUBE_API_KEY', 'mock-youtube-api-key'));
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/");
  vi.restoreAllMocks();
});
afterAll(() => server.close());
