import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./store/firebase";
import ProfilePage from "./pages/Profile";
import { AuthContext, AuthContextType } from "./store/context";
import { SnackbarProvider } from "notistack";
import PostsPage from "./pages/Posts";
import UserPage from "./pages/User";
import RequireAuth from "./RequireAuth";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  {
    path: "/users/:userId",
    element: <UserPage />,
  },
  {
    path: "/posts",
    element: <PostsPage />,
  },
]);

function App() {
  const [user, setUser] = useState<AuthContextType["user"]>(undefined);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      setUser(user);
      console.log(user);
    });
  });

  return (
    <SnackbarProvider
      maxSnack={5}
      anchorOrigin={{ horizontal: "center", vertical: "top" }}
      autoHideDuration={3000}
    >
      <AuthContext.Provider value={{ user }}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </SnackbarProvider>
  );
}

export default App;
