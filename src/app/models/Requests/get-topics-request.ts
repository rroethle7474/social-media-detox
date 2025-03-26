export interface GetTopicsRequest {
    id?: number;
    isActive?: boolean;
    term?: string;
    userId?: string;
    excludeFromTwitter?: boolean;
  }
