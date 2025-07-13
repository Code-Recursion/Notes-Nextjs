export interface UserType {
  userId: string;
  name?: string;
}

export interface Credentials {
  username: string;
  password: string;
  name?: string;
}

export interface INote {
  title: string;
  id: string;
  content: string;
  createdAt: string;
  important: boolean;
  user: string;
  updatedAt: string;
}
