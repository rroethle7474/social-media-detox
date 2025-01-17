export interface ChannelDto {
  id: number;
  isActive: boolean;
  userId: string;
  channelName: string;
  identifier: string;
  description: string;
  contentTypeId: number;
  contentTypeName?: string;
}
