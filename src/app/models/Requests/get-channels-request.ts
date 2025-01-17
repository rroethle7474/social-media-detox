export interface GetChannelsRequest {
  userId?: string;
  isActive?: boolean;
  channelName?: string;
  identifier?: string;
  description?: string;
  contentTypeId?: number;
}
