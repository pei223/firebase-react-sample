import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { auth, db } from "../store/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { AuthContext } from "../store/context";
import Layout from "../Layout";
import { Box, Button, TextField, Typography } from "@mui/material";
import LoadingScreen from "../components/LoadingScreen";
import { Profile } from "../store/types";
import { useSnackbar } from "notistack";
import { isFirebaseError } from "../errors";
import {
  RecaptchaVerifier,
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
} from "firebase/auth";
import SmsRegisterDialog, { SmsStatus } from "../components/SmsRegisterDialog";

const recaptchaId = "recaptcha-container-id";

function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [nickName, setNickName] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [smsStatus, setSmsStatus] = useState<SmsStatus>("None");
  const verificationId = useRef("");

  useEffect(() => {
    setLoading(true);
    if (user == null) {
      return;
    }
    onSnapshot(doc(db, "profiles", user.uid), (doc) => {
      const data = doc.data();
      setLoading(false);
      if (data == null) {
        return;
      }
      setProfile(data as Profile);
      setNickName(data.nickname);
    });
  }, [user]);

  const onUpdate = async () => {
    if (user == null) {
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "profiles", user.uid), {
        user_id: user.uid,
        nickname: nickName,
      });
      enqueueSnackbar(`Success`, { variant: "success" });
    } catch (e) {
      if (!isFirebaseError(e)) {
        enqueueSnackbar(`unexpected error: ${e}`, { variant: "error" });
        return;
      }
      enqueueSnackbar(`unexpected firebase error: ${e}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // https://firebase.google.com/docs/auth/web/multi-factor?hl=ja&authuser=0
  const onPhoneNumberSubmit = useCallback(
    async (phoneNumber: string) => {
      if (user == null) {
        return;
      }

      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaId, {
        size: "invisible",
      });
      setLoading(true);
      multiFactor(user)
        .getSession()
        .then(async (multiFactorSession) => {
          // Specify the phone number and pass the MFA session.
          const phoneInfoOptions = {
            phoneNumber,
            session: multiFactorSession,
          };
          const phoneAuthProvider = new PhoneAuthProvider(auth);
          // Send SMS verification code.
          try {
            verificationId.current = await phoneAuthProvider.verifyPhoneNumber(
              phoneInfoOptions,
              recaptchaVerifier
            );
            setSmsStatus("requireCode");
            enqueueSnackbar(`SMSに送信しました`, { variant: "info" });
          } catch (e) {
            if (!isFirebaseError(e)) {
              enqueueSnackbar(`unexpected error: ${e}`, { variant: "error" });
              return;
            }
            if (e.code === "auth/second-factor-already-in-use") {
              enqueueSnackbar("登録済みの電話番号です", { variant: "warning" });
              return;
            }
            enqueueSnackbar(`unexpected firebase error: ${e}`, {
              variant: "error",
            });
          } finally {
            setLoading(false);
            recaptchaVerifier.clear();
          }
        });
    },
    [user, enqueueSnackbar]
  );
  const onCodeSubmit = useCallback(
    async (code: string) => {
      if (user == null) {
        return;
      }

      setLoading(true);
      try {
        const cred = PhoneAuthProvider.credential(verificationId.current, code);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

        // Complete enrollment.
        await multiFactor(user).enroll(multiFactorAssertion, "SMS");
        setSmsStatus("None");
        enqueueSnackbar(`Success`, { variant: "success" });
      } catch (e) {
        enqueueSnackbar(`unexpected Code error: ${e}`, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [user, enqueueSnackbar]
  );

  const deleteSMS = useCallback(async () => {
    if (user == null) {
      return;
    }
    const factors = multiFactor(user).enrolledFactors.filter(
      (v) => v.displayName === "SMS"
    );
    console.log(factors);
    if (factors.length === 0) {
      return;
    }
    await multiFactor(user).unenroll(factors[0]);
    enqueueSnackbar(`Success`, { variant: "success" });
  }, [user, enqueueSnackbar]);

  const showSMSAuth =
    user != null &&
    user.emailVerified === true &&
    user.providerData.filter((v) => v.providerId === "password").length > 0;

  const isMultiFactorEnabled =
    user != null &&
    multiFactor(user).enrolledFactors.filter((v) => v.displayName === "SMS")
      .length > 0;

  return (
    <Layout>
      <Typography variant="h5">プロフィール</Typography>
      <Typography sx={{ marginTop: 3 }}>
        メールアドレス: {user?.email} (
        {user?.emailVerified === true ? "認証済み" : "未認証"})
        <br />
        ID: {user?.uid}
        <br />
        記事数: {profile?.post_count}
      </Typography>
      <Box sx={{ marginTop: 2 }}>
        <TextField
          label="ニックネーム"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
        />
      </Box>

      <Button sx={{ marginTop: 2 }} onClick={onUpdate} variant="contained">
        更新
      </Button>
      {showSMSAuth && !isMultiFactorEnabled && (
        <Box sx={{ marginTop: 4 }}>
          <Button
            onClick={() => setSmsStatus("requirePhoneNumber")}
            variant="contained"
          >
            SMS認証設定
          </Button>
        </Box>
      )}
      {isMultiFactorEnabled && (
        <Box sx={{ marginTop: 4 }}>
          <Button onClick={() => deleteSMS()} variant="contained">
            SMS認証を解除
          </Button>
        </Box>
      )}
      <SmsRegisterDialog
        smsStatus={smsStatus}
        recaptchaId={recaptchaId}
        onPhoneNumberSubmit={onPhoneNumberSubmit}
        onCodeSubmit={onCodeSubmit}
        onClose={() => setSmsStatus("None")}
      />
      {loading && <LoadingScreen />}
    </Layout>
  );
}
export default ProfilePage;
