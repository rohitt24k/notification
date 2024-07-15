import { Dispatch, SetStateAction } from "react";

export interface UserContextType {
  isUserLoggedIn: boolean;
  setIsUserLoggedIn: Dispatch<SetStateAction<boolean>>;
}
