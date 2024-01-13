import { Timestamp } from "firebase/firestore";

export type Profile = {
  nickname: string;
  intro: string;
  post_count: number;
  user_id: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
};

export type PostForm = Omit<
  Post,
  "id" | "user_id" | "created_at" | "updated_at"
> & {
  id?: string;
};

export const NullPostFormData: PostForm = {
  title: "",
  content: "",
};
