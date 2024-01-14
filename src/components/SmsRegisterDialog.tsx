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
  smsStatus: SmsStatus;
  recaptchaId?: string;
  invisibleRacaptchaId?: string;
  onPhoneNumberSubmit: (phoneNumber: string) => void;
  onCodeSubmit: (code: string) => void;
  onClose: () => void;
};

function SmsRegisterDialog({
  smsStatus,
  recaptchaId,
  invisibleRacaptchaId,
  onCodeSubmit,
  onPhoneNumberSubmit,
  onClose,
}: Props) {
  const [phoneNumber, setPhoneNumber] = useState("+81 ");
  const [code, setCode] = useState("");

  return (
    <Dialog open={smsStatus !== "None"} onClose={onClose}>
      <DialogTitle>SMS認証登録</DialogTitle>
      <DialogContent>
        <Box>
          <TextField
            fullWidth
            id="phone"
            label="電話番号"
            variant="standard"
            value={phoneNumber}
            disabled={smsStatus !== "requirePhoneNumber"}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Box>
        <Box sx={{ marginTop: 1, marginBottom: 2 }}>
          <Button
            variant="contained"
            disabled={smsStatus !== "requirePhoneNumber"}
            onClick={() => onPhoneNumberSubmit(phoneNumber)}
            id={invisibleRacaptchaId}
          >
            送信
          </Button>
        </Box>
        <div id={recaptchaId}></div>
        {smsStatus === "requireCode" && (
          <>
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
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}
export default SmsRegisterDialog;
