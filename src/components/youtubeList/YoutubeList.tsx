import type { CommentThread } from '../../types/youtube';
import CommentItem from '../CommentItem';

interface Props { items: CommentThread[]; }
function YoutubeList({ items }: Props) {
  return <div>{items.map(item => <CommentItem key={item.id} item={item} />)}</div>;
}
export default YoutubeList;
