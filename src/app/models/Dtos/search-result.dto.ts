import { NoteDto } from "./note.dto";

export interface SearchResultDto {
  id: number;
  title: string;
  description: string;
  userName: string;
  url: string;
  embedUrl: string;
  videoId: string;
  thumbnailUrl: string;
  publishedAt: Date;
  term: string;
  channelName: string;
  contentTypeId: number;
  isHomePage: boolean;
  dateAdded: Date;
  embeddedHtml?: string | null;
  topSearchResult: boolean;
  notes: NoteDto[];
  isChannel: boolean;
}
