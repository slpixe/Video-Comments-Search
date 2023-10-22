import axios from 'axios';
import queryString from 'query-string';
import { IYTC } from '../../types';
import { useQuery } from '@tanstack/react-query';

export interface IGetComments {
  // pageToken?: string;
  pageToken?: number | undefined | string;
  videoId: string;
  searchQuery: string;
}

const youtubeApi = 'https://www.googleapis.com/youtube/v3';
const thing = 'AIzaSyC1gZmsaoi4eTBAOOZ--8c4qKB1ZsSobQ0';

let searchObj = {
  part: 'snippet',
  videoId: `ljY02BAnTiY`,
  key: `${thing}`,
  searchTerms: true ? 'Marley' : '',
  maxResults: `5`.toString(),
  // pageToken: '',
  pageToken: undefined,
};

export const getComments = async (props: IGetComments): Promise<IYTC> => {
  searchObj.videoId = props.videoId;
  const queryParams = queryString.stringify(searchObj);

  const { data } = await axios.get(`${youtubeApi}/commentThreads?${queryParams}`);
  return data;
};

export const useComments = () => {
    return useQuery({
      queryKey: [`ytc`, `vid-${'ljY02BAnTiY'}`],
      queryFn: () => getComments({ videoId: 'ljY02BAnTiY', searchQuery: '' }),
    });
  }