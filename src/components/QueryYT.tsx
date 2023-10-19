import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { useState } from 'react';
import axios from 'axios';
import { IYTC } from '../../types';

const queryClient = new QueryClient();
const youtubeApi = 'https://www.googleapis.com/youtube/v3';

let searchObj = {
  part: 'snippet',
  videoId: 'ljY02BAnTiY',
  key: 'AIzaSyC1gZmsaoi4eTBAOOZ--8c4qKB1ZsSobQ0',
  searchTerms: true ? 'Marley' : '',
  maxResults: `5`.toString(),
  // pageToken:
  //   this.state.nextPageToken && nextPage ? this.state.nextPageToken : null,
};
let queryParams = new URLSearchParams(searchObj).toString();

// const axiosConfig = {
//   headers: {
//     Referer: 'app.github.dev', // Replace with your desired referer URL
//   },
// };

const getComments = async (): Promise<IYTC> => {
  // const { data } = await axios.get('https://jsonplaceholder.typicode.com/posts');
  const { data } = await axios.get(`${youtubeApi}/commentThreads?${queryParams}`);
  return data;
};

(async () => {
  try {
    const a = await getComments();
    console.log('===a', a.items[0].snippet.topLevelComment.snippet.textDisplay);
  } catch (error) {
    console.error(error);
  }
})();

function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: getComments,
  });
}

// function Posts({ setPostId }) {
function Posts() {
  const queryClient = useQueryClient();
  const { status, data, error, isFetching } = usePosts();

  return (
    <div>
      <h1>Posts</h1>
      {/* <div>
        {status === 'pending' ? (
          'Loading...'
        ) : status === 'error' ? (
          <span>Error: {error.message}</span>
        ) : (
          <>
            <div>
              {data.map((post) => (
                <p key={post.id}>
                  <a
                    // onClick={() => setPostId(post.id)}
                    href="#"
                    style={
                      // We can access the query data here to show bold links for
                      // ones that are cached
                      queryClient.getQueryData(['post', post.id])
                        ? {
                            fontWeight: 'bold',
                            color: 'green',
                          }
                        : {}
                    }
                  >
                    {post.title}
                  </a>
                </p>
              ))}
            </div>
            <div>{isFetching ? 'Background Updating...' : ' '}</div>
          </>
        )}
      </div> */}
    </div>
  );
}

export const QueryYT = () => {
  // const [postId, setPostId] = useState(-1);
  return (
    <QueryClientProvider client={queryClient}>
      <div>QueryYT</div>
      <Posts />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
};
