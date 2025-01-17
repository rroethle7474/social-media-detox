export interface GetSearchResultsRequest {
  userId?: string;
  contentTypeId?: number;
  fromDate?: Date;
  toDate?: Date;
  isMVPResults?: boolean; // MVP results are results that are a top search result or has a note attached to it
}
