import { useEffect, useState } from "react";
import { db } from "../store/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Layout from "../Layout";
import { Button, Typography } from "@mui/material";
import LoadingScreen from "../components/LoadingScreen";
import { useNavigate, useParams } from "react-router-dom";
import { Profile } from "../store/types";

function UserPage() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    if (userId == null) {
      return;
    }
    onSnapshot(doc(db, "profiles", userId), (doc) => {
      const data = doc.data();
      setLoading(false);
      if (data == null) {
        return;
      }
      setProfile(data as Profile);
    });
  }, [userId]);

  return (
    <Layout>
      <Typography variant="h5">ユーザー情報</Typography>
      <Typography sx={{ marginTop: 3 }}>
        ニックネーム: {profile?.nickname}
        <br />
        ID: {userId}
        <br />
        記事数: {profile?.post_count}
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate(`/posts?user_id=${userId}`)}
      >
        ユーザーの記事一覧
      </Button>
      {loading && <LoadingScreen />}
    </Layout>
  );
}
export default UserPage;
