import { SearchResultDto } from "./search-result.dto";

export interface NoteDto {
  id: number;
  userId?: string | null;
  title: string;
  message: string;
  searchResultId: number;
}
