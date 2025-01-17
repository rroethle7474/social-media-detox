import { SearchResultDto } from "./search-result.dto";

export interface TopSearchResultDto {
  id: number;
  userId: string;
  searchResultId: number;
  searchResult: SearchResultDto;
}
