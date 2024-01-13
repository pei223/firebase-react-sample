import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { PostForm } from "../store/types";

type Props = {
  open: boolean;
  formData: PostForm;
  onSubmit: (form: PostForm) => void;
  onClose: () => void;
};

function PostFormDialog({ open, formData, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(formData.title);
  const [content, setContent] = useState(formData.content);

  useEffect(() => {
    setTitle(formData.title);
    setContent(formData.content);
  }, [formData]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ブログ作成</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="title"
          variant="standard"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          sx={{
            marginTop: 2,
          }}
          fullWidth
          multiline
          rows="5"
          label="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => onSubmit({ id: formData.id, title, content })}
        >
          {formData.id == null ? "登録" : "更新"}
        </Button>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
export default PostFormDialog;
