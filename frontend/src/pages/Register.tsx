import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

import { registerUser } from "../services/authService";


function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] =
    useState(false);


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name,
        email,
        phone: phone || undefined,
        password,
      });

      // Credentials are saved — send the user straight to
      // login, with the email prefilled for them.
      navigate("/login", {
        state: {
          message:
            "Account created successfully! Please log in to continue.",
          email,
        },
      });

    } catch (error: any) {
      if (error?.response?.status === 409) {
        // Email or phone already registered — point the user
        // to login instead of a raw error.
        setAlreadyRegistered(true);
        setError("");
      } else {
        setError(
          error?.response?.data?.detail ||
            "Unable to create your account. Please try again.",
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
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

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-neutral-500">
                Join Ankit Tours and start planning your next
                journey.
              </p>
            </div>


            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {alreadyRegistered && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                An account with this email already exists.{" "}
                <Link
                  to="/login"
                  state={{ email }}
                  className="font-semibold underline hover:text-amber-900"
                >
                  Login instead
                </Link>
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >

              {/* Name */}
              <div>
                <label className="text-sm font-medium">
                  Full name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  required
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>


              {/* Email */}
              <div>
                <label className="text-sm font-medium">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setAlreadyRegistered(false);
                  }}
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>


              {/* Phone */}
              <div>
                <label className="text-sm font-medium">
                  Phone number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+91 9876543210"
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>


              {/* Password */}
              <div>
                <label className="text-sm font-medium">
                  Password
                </label>

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
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full rounded-xl border border-neutral-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
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


              {/* Confirm password */}
              <div>
                <label className="text-sm font-medium">
                  Confirm password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Repeat your password"
                  required
                  className="mt-2 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
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
                  ? "Creating account..."
                  : "Create account"}
              </button>

            </form>


            <p className="mt-7 text-center text-sm text-neutral-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-black hover:underline"
              >
                Login
              </Link>
            </p>

          </div>

        </div>
      </main>
    </div>
  );
}


export default Register;
