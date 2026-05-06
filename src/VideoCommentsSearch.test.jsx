import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "./mocks/server";
import VideoCommentsSearch from "./VideoCommentsSearch";

describe("VideoCommentsSearch", () => {
  it("renders the search form", () => {
    render(<VideoCommentsSearch />);
    expect(screen.getByLabelText(/youtube video id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search term/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("shows results after submitting a valid video ID", async () => {
    const user = userEvent.setup();
    render(<VideoCommentsSearch />);

    await user.type(screen.getByLabelText(/youtube video id/i), "testVideoId");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText("This is the first comment")).toBeInTheDocument();
    });
    expect(screen.getByText("Another great video!")).toBeInTheDocument();
    expect(screen.getByText("Keep up the good work")).toBeInTheDocument();
  });

  it("shows 'No Results found' when API returns no items", async () => {
    server.use(
      http.get(
        "https://www.googleapis.com/youtube/v3/commentThreads",
        () => HttpResponse.json({ pageInfo: { totalResults: 0, resultsPerPage: 30 }, items: [] })
      )
    );

    const user = userEvent.setup();
    render(<VideoCommentsSearch />);

    await user.type(screen.getByLabelText(/youtube video id/i), "testVideoId");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  it("shows an error message when the API returns an error response", async () => {
    server.use(
      http.get(
        "https://www.googleapis.com/youtube/v3/commentThreads",
        () =>
          HttpResponse.json(
            {
              error: {
                code: 403,
                message: "The caller does not have permission",
                errors: [{ reason: "forbidden" }],
              },
            },
            { status: 403 }
          )
      )
    );

    const user = userEvent.setup();
    render(<VideoCommentsSearch />);

    await user.type(screen.getByLabelText(/youtube video id/i), "testVideoId");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/access to this video's comments is forbidden/i)
      ).toBeInTheDocument();
    });
  });

  it("disables the search button while loading", async () => {
    let resolveRequest;
    server.use(
      http.get(
        "https://www.googleapis.com/youtube/v3/commentThreads",
        () =>
          new Promise((resolve) => {
            resolveRequest = resolve;
          })
      )
    );

    const user = userEvent.setup();
    render(<VideoCommentsSearch />);

    await user.type(screen.getByLabelText(/youtube video id/i), "testVideoId");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();

    resolveRequest(HttpResponse.json({ pageInfo: { totalResults: 0, resultsPerPage: 30 }, items: [] }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /search/i })).not.toBeDisabled();
    });
  });

  it("clears previous error when submitting a new search", async () => {
    server.use(
      http.get(
        "https://www.googleapis.com/youtube/v3/commentThreads",
        () =>
          HttpResponse.json(
            { error: { code: 500, message: "Internal error", errors: [] } },
            { status: 500 }
          )
      )
    );

    const user = userEvent.setup();
    render(<VideoCommentsSearch />);

    await user.type(screen.getByLabelText(/youtube video id/i), "testVideoId");
    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    // Now fix the handler and search again
    server.resetHandlers();

    await user.click(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
