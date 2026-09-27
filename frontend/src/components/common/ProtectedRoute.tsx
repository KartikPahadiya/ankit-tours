import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";


function ProtectedRoute() {
  const {
    user,
    loading,
  } = useAuth();

  const location = useLocation();


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-black" />
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }


  return <Outlet />;
}


export default ProtectedRoute;
