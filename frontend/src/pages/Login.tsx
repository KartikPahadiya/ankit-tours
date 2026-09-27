import { FormEvent, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import {
  loginUser,
} from "../services/authService";

import {
  useAuth,
} from "../context/AuthContext";


function Login() {
  const navigate = useNavigate();

  const location = useLocation();

  const { login } = useAuth();


  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const successMessage =
    location.state?.message;


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

      const tokens = await loginUser({
        email,
        password,
      });

      const loggedInUser = await login(tokens);

      if (loggedInUser.role === "admin") {
        // Admins land straight in the admin panel
        navigate("/admin", { replace: true });
        return;
      }

      // Regular users return to the page they were on
      const from = (location.state as { from?: string } | null)?.from;

      navigate(from || "/", { replace: true });

    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        "Invalid email or password.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-neutral-50">

      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center px-5 lg:px-8">

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black font-bold text-white">
              A
            </div>

            <span className="text-lg font-bold">
              Ankit Tours
            </span>
          </Link>

        </div>
      </header>


      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-12">

        <div className="w-full max-w-md">

          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-black"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>


          <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-9">

            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Login to manage your trips and bookings.
            </p>


            {successMessage && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}


            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >

              {/* Email */}
              <div>

                <label className="text-sm font-medium">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />

              </div>


              {/* Password */}
              <div>

                <div className="flex items-center justify-between">

                  <label className="text-sm font-medium">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-neutral-500 hover:text-black"
                  >
                    Forgot password?
                  </Link>

                </div>


                <div className="relative mt-2">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Your password"
                    required
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>


              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                {loading
                  ? "Signing in..."
                  : "Login"}

              </button>

            </form>


            <p className="mt-7 text-center text-sm text-neutral-500">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-black hover:underline"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>

      </main>

    </div>
  );
}


export default Login;
