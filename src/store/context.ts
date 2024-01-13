import { User } from "firebase/auth";
import { createContext } from "react";

type AuthContextType = {
  user: User | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
});
