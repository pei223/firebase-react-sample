import { useContext, useEffect } from "react";
import { AuthContext } from "./store/context";
import LoadingScreen from "./components/LoadingScreen";
import NoAuthenticatedLayout from "./NoAuthenticatedLayout";
import { useNavigate } from "react-router-dom";

type Props = {
  children?: React.ReactNode;
};
function RequireAuth({ children }: Props) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [navigate, user]);

  if (user === undefined) {
    return (
      <NoAuthenticatedLayout>
        <LoadingScreen />
      </NoAuthenticatedLayout>
    );
  }
  if (user === null) {
    // useEffect経由でログイン画面に飛ばされる
    return <></>;
  }
  return <>{children}</>;
}

export default RequireAuth;
