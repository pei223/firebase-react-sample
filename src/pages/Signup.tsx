import { useState } from "react";
import { auth, db } from "../store/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Typography, Box, TextField, Button } from "@mui/material";
import NoAuthenticatedLayout from "../NoAuthenticatedLayout";
import { isFirebaseError } from "../errors";
import { useSnackbar } from "notistack";
import LoadingScreen from "../components/LoadingScreen";
import { doc, setDoc } from "firebase/firestore";

function Signup() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onSignup = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // 検索用に登録
      await setDoc(doc(db, "profiles", userCredential.user.uid), {
        user_id: userCredential.user.uid,
        nickname: "default", // 面倒なので初期値指定
        post_count: 0,
      });
      navigate("/profile");
    } catch (e) {
      if (!isFirebaseError(e)) {
        enqueueSnackbar(`unexpected error: ${e}`, { variant: "error" });
        return;
      }
      if (e.code === "auth/email-already-in-use") {
        enqueueSnackbar("登録済みのメールアドレスです", { variant: "warning" });
        return;
      }
      enqueueSnackbar(`unexpected firebase error: ${e}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // NOTE: 今回の趣旨ではないしめんどいのでバリデーションはしていない
  return (
    <NoAuthenticatedLayout>
      <Typography variant="h5">ユーザー登録</Typography>
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
        <Button onClick={onSignup} variant="contained">
          登録
        </Button>
      </Box>
      {loading && <LoadingScreen />}
    </NoAuthenticatedLayout>
  );
}
export default Signup;
