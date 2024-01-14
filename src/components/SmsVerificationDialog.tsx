import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { useState } from "react";

export type SmsStatus = "None" | "requirePhoneNumber" | "requireCode";

type Props = {
  open: boolean;
  recaptchaId: string;
  onCodeSubmit: (code: string) => void;
  onClose: () => void;
};

function SmsVerificationDialog({
  open,
  recaptchaId,
  onCodeSubmit,
  onClose,
}: Props) {
  const [code, setCode] = useState("");

  return (
    <>
      <div id={recaptchaId}></div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>多要素認証(SMS)</DialogTitle>
        <DialogContent>
          <Box>
            <TextField
              sx={{
                marginTop: 2,
              }}
              fullWidth
              label="コード"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </Box>
          <Box sx={{ marginTop: 1 }}>
            <Button variant="contained" onClick={() => onCodeSubmit(code)}>
              送信
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default SmsVerificationDialog;
