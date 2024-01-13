import { FirebaseError } from "firebase/app";

export function isFirebaseError(e: unknown): e is FirebaseError {
  return e instanceof Object && "code" in e;
}
