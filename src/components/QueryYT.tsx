import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { useState } from 'react';
import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';
import { IYTC } from '../../types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const youtubeApi = 'https://www.googleapis.com/youtube/v3';
const thing = 'AIzaSyC1gZmsaoi4eTBAOOZ--8c4qKB1ZsSobQ0';

// const axiosConfig = {
//   headers: {
//     Referer: 'app.github.dev', // Replace with your desired referer URL
//   },
// };

let searchObj = {
  part: 'snippet',
  videoId: `ljY02BAnTiY`,
  key: `${thing}`,
  searchTerms: true ? 'Marley' : '',
  maxResults: `5`.toString(),
  pageToken: '',
};

interface IGetComments {
  pageToken?: string;
}
const getComments = async (props: IGetComments = {}): Promise<IYTC> => {
  // const pagedSearchObj = { ...searchObj, pageToken: props.pageToken };
  searchObj.pageToken = props.pageToken || '';
  const queryParams = new URLSearchParams(searchObj).toString();

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

function useComments() {
  return useQuery({
    queryKey: [`ytc`, `${searchObj.videoId}`, `${searchObj.pageToken}`],
    queryFn: () => getComments({ pageToken: '' }),
  });
}

// function Posts({ setPostId }) {
function Comments() {
  const queryClient = useQueryClient();
  const { status, data, error, isFetching } = useComments();

  return (
    <div>
      <h1>Comments</h1>
      <div>
        {status === 'pending' ? (
          'Loading...'
        ) : status === 'error' ? (
          <span>Error: {error.message}</span>
        ) : (
          <>
            <div>
              {data.items.map((item) => (
                <p key={item.id}>
                  <a
                    // onClick={() => setPostId(post.id)}
                    href="#"
                    style={
                      // We can access the query data here to show bold links for
                      // ones that are cached
                      queryClient.getQueryData(['post', item.id])
                        ? {
                            fontWeight: 'bold',
                            color: 'green',
                          }
                        : {}
                    }
                  >
                    {item.snippet.topLevelComment.snippet.textDisplay}
                  </a>
                </p>
              ))}
            </div>
            <div>{isFetching ? 'Background Updating...' : ' '}</div>
          </>
        )}
      </div>
    </div>
  );
}

export const QueryYT = () => {
  // const [postId, setPostId] = useState(-1);
  return (
    <QueryClientProvider client={queryClient}>
      <div>QueryYT</div>
      <Comments />
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
};
