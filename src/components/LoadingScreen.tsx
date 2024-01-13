import { CircularProgress } from "@mui/material";
import styled from "styled-components";

const StyledFullScreen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0);
`;

function LoadingScreen() {
  return (
    <StyledFullScreen>
      <CircularProgress color="primary" size={70} />
    </StyledFullScreen>
  );
}

export default LoadingScreen;
