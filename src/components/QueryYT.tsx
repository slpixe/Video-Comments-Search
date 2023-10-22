// import { useQuery } from '@tanstack/react-query';
// import { getComments, useComments } from '../api/ytc';
import { useComments } from '../api/ytc';

// function Posts({ setPostId }) {
// const Comments = ({ videoId, searchQuery }: { videoId: String; searchQuery: String }) => {
const Comments = () => {
  const { data, error, isFetching, status } = useComments();

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
};

export const QueryYT = () => {
  // const [postId, setPostId] = useState(-1);
  return (
    <div>
      <div>QueryYT</div>
      <Comments />
    </div>
  );
};
