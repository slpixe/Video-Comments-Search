import { http, HttpResponse } from "msw";
import { commentThreadsFixture } from "./fixtures/commentThreads";

export const handlers = [
  http.get(
    "https://www.googleapis.com/youtube/v3/commentThreads",
    () => {
      return HttpResponse.json(commentThreadsFixture);
    }
  ),
];
