import { useContext, useEffect, useState } from "react";
import { db } from "../store/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { AuthContext } from "../store/context";
import Layout from "../Layout";
import { Box, Button, TextField, Typography } from "@mui/material";
import LoadingScreen from "../components/LoadingScreen";
import { Profile } from "../store/types";
import { useSnackbar } from "notistack";
import { isFirebaseError } from "../errors";

function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [nickName, setNickName] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();

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

  return (
    <Layout>
      <Typography variant="h5">プロフィール</Typography>
      <Typography sx={{ marginTop: 3 }}>
        メールアドレス: {user?.email}
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
      {loading && <LoadingScreen />}
    </Layout>
  );
}
export default ProfilePage;
