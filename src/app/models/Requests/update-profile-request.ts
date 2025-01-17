export interface UpdateProfileRequest {
    userId?: string;
    userName?: string;
    newUserName?: string;
    firstName?: string;
    lastName?: string;
    isAdmin: boolean;
  }
