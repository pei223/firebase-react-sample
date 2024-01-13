import { useState } from "react";
import { auth, db } from "../store/firebase";
import {
  GithubAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import NoAuthenticatedLayout from "../NoAuthenticatedLayout";
import { Box, Button, Link, TextField, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { isFirebaseError } from "../errors";
import LoadingScreen from "../components/LoadingScreen";
import { setDoc, doc, getDoc } from "firebase/firestore";

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("repo");

function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (e) {
      if (!isFirebaseError(e)) {
        enqueueSnackbar(`unexpected error: ${e}`, { variant: "error" });
        return;
      }
      if (
        e.code === "auth/invalid-email" ||
        e.code === "auth/invalid-credential"
      ) {
        enqueueSnackbar("認証情報が正しくありません", { variant: "warning" });
        return;
      }
      enqueueSnackbar(`unexpected firebase error: ${e}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onGithubSignin = () => {
    signInWithPopup(auth, githubProvider)
      .then(async (result) => {
        const user = result.user;
        const profRef = doc(db, "profiles", user.uid);
        if (!(await getDoc(profRef)).exists()) {
          await setDoc(profRef, {
            user_id: user.uid,
            nickname: "default", // 面倒なので初期値指定
            post_count: 0,
          });
        }
        navigate("/profile");
      })
      .catch((e) => {
        if (!isFirebaseError(e)) {
          enqueueSnackbar(`unexpected error: ${e}`, { variant: "error" });
          return;
        }
        enqueueSnackbar(`unexpected firebase error: ${e}`, {
          variant: "error",
        });
      });
  };

  // NOTE: 今回の趣旨ではないしめんどいのでバリデーションはしていない
  return (
    <NoAuthenticatedLayout>
      <Typography variant="h5">ログイン</Typography>
      <Box sx={{ marginTop: 4 }}>
        <TextField
          label="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Box>
      <Box sx={{ marginTop: 2 }}>
        <TextField
          label="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Box>
      <Box sx={{ marginTop: 4 }}>
        <Button onClick={onLogin} variant="contained">
          ログイン
        </Button>
      </Box>
      <Box sx={{ marginTop: 4 }}>
        <Button onClick={onGithubSignin} variant="contained">
          Githubでログイン/登録
        </Button>
      </Box>
      <Box sx={{ marginTop: 1 }}>
        <Link onClick={() => navigate("/signup")}>メールアドレスで登録</Link>
      </Box>
      {loading && <LoadingScreen />}
    </NoAuthenticatedLayout>
  );
}
export default Login;
