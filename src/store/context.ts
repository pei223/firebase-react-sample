import { User } from "firebase/auth";
import { createContext } from "react";

export type AuthContextType = {
  user: User | null | undefined;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
});
