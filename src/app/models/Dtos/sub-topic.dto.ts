export interface SubTopicDto {
  id: number;
  isActive: boolean;
  excludeFromTwitter: boolean;
  term: string;
  topicId: number;
  topicTerm?: string;
  userId: string;
}
