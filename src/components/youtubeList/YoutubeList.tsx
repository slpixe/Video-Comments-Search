import type { FormEvent } from "react";
import type { CommentThread, PageInfo } from "../../types/youtube";
import CommentItem from "../CommentItem";

interface Props {
  items: CommentThread[];
  pageInfo: PageInfo | undefined;
  search: (event: FormEvent, nextPage: boolean) => void;
  apiKey: string;
}

function YoutubeList({ items, apiKey }: Props) {
  return (
    <div style={{ height: '100%' }}>
      {items.map((item, index) => (
        <CommentItem key={item.id} item={item} index={index} apiKey={apiKey} />
      ))}
    </div>
  );
}

export default YoutubeList;