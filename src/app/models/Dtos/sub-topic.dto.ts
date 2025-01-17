export interface SubTopicDto {
  id: number;
  isActive: boolean;
  term: string;
  topicId: number;
  topicTerm?: string;
  userId: string;
}
