import { useContext, useEffect, useState } from "react";
import { db } from "../store/firebase";
import {
  QueryConstraint,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  getDocs,
  updateDoc,
  runTransaction,
  Transaction,
} from "firebase/firestore";
import { AuthContext } from "../store/context";
import Layout from "../Layout";
import { Box, Fab, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LoadingScreen from "../components/LoadingScreen";
import { useSnackbar } from "notistack";
import { Link, useSearchParams } from "react-router-dom";
import { isFirebaseError } from "../errors";
import { v4 as uuidv4 } from "uuid";
import PostFormDialog from "../components/PostFormDialog";
import { NullPostFormData, Post, PostForm, Profile } from "../store/types";

function PostsPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PostForm | null>(null);
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});

  // リアルタイム更新のsnapshotである必要はないが勉強のため.
  // 更新されると更新頻度の少ないプロフィールのフェッチも走るので本来はよくない.
  useEffect(() => {
    setLoading(true);
    const queries: QueryConstraint[] = [];
    queries.push(limit(10));
    queries.push(orderBy("created_at", "desc"));
    // ユーザーIDでのフィルタリング
    if (searchParams.get("user_id") != null) {
      queries.push(where("user_id", "==", searchParams.get("user_id")));
    }
    const q = query(collection(db, "posts"), ...queries);

    onSnapshot(q, (snapshot) => {
      const newPosts: Post[] = [];
      snapshot.forEach((v) => {
        newPosts.push({ ...(v.data() as Post), id: v.id });
      });
      setPosts(newPosts);
      setLoading(false);
    });
  }, [searchParams]);

  // 記事一覧取得後にローディングが消えるため、作成者の表示だけちらつきはある.
  // ローディングの制御など可能ではあるがめんどいし今回の趣旨じゃないのでやらない.
  useEffect(() => {
    (async () => {
      if (posts.length === 0) {
        return;
      }
      const q = query(
        collection(db, "profiles"),
        where(
          "user_id",
          "in",
          posts.map((v) => v.user_id)
        )
      );
      const docs = await getDocs(q);
      const newProfileMap: Record<string, Profile> = {};
      docs.forEach((v) => {
        const profile = v.data() as Profile;
        newProfileMap[profile.user_id] = profile;
      });
      setProfileMap(newProfileMap);
    })().then();
  }, [posts]);

  const onCreateOrUpdatePost = async ({ id, title, content }: PostForm) => {
    if (formData == null || user == null) {
      return;
    }
    const isCreate = id == null;
    try {
      setLoading(true);
      const now = serverTimestamp();
      if (isCreate) {
        // トランザクションで記事数と記事投稿を合わせる
        await runTransaction(db, async (tx: Transaction) => {
          const profileRef = doc(db, "profiles", user.uid);
          const profileData = await tx.get(profileRef);
          const profile = profileData.data() as Profile;
          tx.set(doc(db, "posts", uuidv4()), {
            user_id: user.uid,
            updated_at: now,
            created_at: now,
            title,
            content,
          });
          tx.update(profileRef, { post_count: profile.post_count + 1 });
        });
      } else {
        await updateDoc(doc(db, "posts", id), {
          updated_at: now,
          title,
          content,
        });
      }
      setFormData(null);
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

  const onDeletePost = async (v: Post) => {
    if (user == null) {
      return;
    }
    if (!window.confirm(`${v.title}を削除します。よろしいですか？`)) {
      return;
    }
    try {
      setLoading(true);
      // トランザクションで記事数と記事投稿を合わせる
      await runTransaction(db, async (tx: Transaction) => {
        const profileRef = doc(db, "profiles", user.uid);
        const profileData = await tx.get(profileRef);
        const profile = profileData.data() as Profile;
        const newPostCount =
          profile.post_count - 1 >= 0 ? profile.post_count - 1 : 0;
        tx.delete(doc(db, "posts", v.id));
        tx.update(profileRef, { post_count: newPostCount });
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
      {posts.map((v) => (
        <Box
          sx={{
            borderTop: "1px solid gainsboro",
            padding: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h5">
              {v.title}({v.id})
            </Typography>
            {profileMap[v.user_id] != null && (
              <Link to={`/users/${v.user_id}`}>
                <Typography sx={{ marginTop: 1 }} variant="body1">
                  作成者: {profileMap[v.user_id].nickname}({v.user_id})
                </Typography>
              </Link>
            )}
            <Typography
              sx={{ marginTop: 1 }}
              variant="body1"
              color="text.secondary"
            >
              {v.content}
            </Typography>
            <Typography
              sx={{ marginTop: 2 }}
              variant="caption"
              color="text.secondary"
            >
              {v.created_at != null &&
                `作成日: ${v.created_at.toDate().toISOString()}`}
              <br />
              {v.updated_at != null &&
                `更新日: ${v.updated_at.toDate().toISOString()}`}
            </Typography>
          </Box>
          {v.user_id === user?.uid && (
            <Box>
              <IconButton
                onClick={() => {
                  setFormData({
                    id: v.id,
                    title: v.title,
                    content: v.content,
                  });
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDeletePost(v)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}
      <PostFormDialog
        open={formData != null}
        formData={formData || NullPostFormData}
        onSubmit={(formData) => onCreateOrUpdatePost(formData)}
        onClose={() => setFormData(null)}
      />
      <Fab
        sx={{ position: "fixed", right: "80px", bottom: "80px" }}
        color="primary"
        onClick={() => {
          setFormData({
            title: "",
            content: "",
          });
        }}
      >
        <AddIcon />
      </Fab>
      {loading && <LoadingScreen />}
    </Layout>
  );
}
export default PostsPage;
