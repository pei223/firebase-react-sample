import { useRef, useState } from "react";
import { auth, db } from "../store/firebase";
import {
  GithubAuthProvider,
  MultiFactorError,
  MultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  getMultiFactorResolver,
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
import SmsVerificationDialog from "../components/SMSVerificationDialog";

const recaptchaId = "recaptcha-container-id";

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("repo");

function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requireMFA, setRequireMFA] = useState(false);
  const verificationId = useRef("");
  const resolver = useRef<MultiFactorResolver | null>(null);

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
      // 多要素認証が必要
      if (e.code === "auth/multi-factor-auth-required") {
        await setupMFAVerification(e as MultiFactorError);
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

  // https://firebase.google.com/docs/auth/web/multi-factor?hl=ja#signing_users_in_with_a_second_factor
  const setupMFAVerification = async (e: MultiFactorError) => {
    resolver.current = getMultiFactorResolver(auth, e);
    if (
      resolver.current.hints[0].factorId !== PhoneMultiFactorGenerator.FACTOR_ID
    ) {
      enqueueSnackbar(`unexpected MFA error: ${e}`, { variant: "error" });
      return;
    }
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaId, {
      size: "invisible",
    });
    const phoneInfoOptions = {
      multiFactorHint: resolver.current.hints[0],
      session: resolver.current.session,
    };
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    setLoading(false);
    verificationId.current = await phoneAuthProvider.verifyPhoneNumber(
      phoneInfoOptions,
      recaptchaVerifier
    );
    setRequireMFA(true);
    enqueueSnackbar(`送信しました`, { variant: "info" });
  };
  const onMFACodeSubmit = async (code: string) => {
    if (resolver.current == null) {
      return;
    }
    setLoading(true);
    try {
      const cred = PhoneAuthProvider.credential(verificationId.current, code!);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await resolver.current.resolveSignIn(multiFactorAssertion);
      navigate("/profile");
    } catch (e) {
      enqueueSnackbar(`unexpected MFA login error: ${e}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // NOTE: 今回の趣旨ではないしめんどいのでバリデーションはしていない
  return (
    <NoAuthenticatedLayout>
      <Typography variant="h5">ログイン</Typography>
      <Box sx={{ marginTop: 4 }}>
        <TextField
          id="email"
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
      <SmsVerificationDialog
        open={requireMFA}
        recaptchaId={recaptchaId}
        onCodeSubmit={onMFACodeSubmit}
        onClose={() => setRequireMFA(false)}
      />
      {loading && <LoadingScreen />}
    </NoAuthenticatedLayout>
  );
}
export default Login;
