import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import { signOut } from "firebase/auth";
import { ReactNode, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./store/context";
import { auth } from "./store/firebase";

type Props = {
  children?: ReactNode;
};

function Layout({ children }: Props) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      <AppBar>
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="h6"
            marginLeft="20px"
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Firebase sample app
          </Typography>
          <Box>
            <Typography component="p">
              {user?.email}({user?.uid})
            </Typography>
            <Button color="inherit" onClick={() => navigate("/posts")}>
              <Typography>posts</Typography>
            </Button>
            <Button color="inherit" onClick={() => navigate("/profile")}>
              <Typography>profile</Typography>
            </Button>
            <Button color="inherit" onClick={onLogout}>
              <Typography>logout</Typography>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container sx={{ paddingTop: 2 }}>{children}</Container>
    </>
  );
}

export default Layout;
