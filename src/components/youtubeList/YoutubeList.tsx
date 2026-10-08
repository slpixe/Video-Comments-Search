import type { CommentThread } from '../../types/youtube';
import CommentItem from '../CommentItem';

interface Props { items: CommentThread[]; accessToken: string; }
function YoutubeList({ items, accessToken }: Props) {
  return <div>{items.map((item, index) => <CommentItem key={item.id} item={item} index={index} accessToken={accessToken} />)}</div>;
}
export default YoutubeList;
