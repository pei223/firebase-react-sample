import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
} from "@mui/material";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  children?: ReactNode;
};

function NoAuthenticatedLayout({ children }: Props) {
  const navigate = useNavigate();

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
            <Button color="inherit" onClick={() => navigate("/login")}>
              <Typography>login</Typography>
            </Button>
            <Button color="inherit" onClick={() => navigate("/signup")}>
              <Typography>signup</Typography>
            </Button>
            <Button color="inherit" onClick={() => navigate("/posts")}>
              <Typography>posts</Typography>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container sx={{ paddingTop: 2 }}>{children}</Container>
    </>
  );
}

export default NoAuthenticatedLayout;
