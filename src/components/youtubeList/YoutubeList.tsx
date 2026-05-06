import type { FormEvent } from "react";
import type { CommentThread, PageInfo } from "../../types/youtube";

interface Props {
  items: CommentThread[];
  pageInfo: PageInfo | undefined;
  search: (event: FormEvent, nextPage: boolean) => void;
}

function YoutubeList({ items }: Props) {
  return (
    <div style={{ height: '100%' }}>
      {items.map(item => (
        <div key={item.id} className={'searchItem'}>
          {item.snippet.topLevelComment.snippet.textOriginal}
        </div>
      ))}
    </div>
  );
}

export default YoutubeList;