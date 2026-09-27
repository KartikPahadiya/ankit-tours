import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  CalendarCheck,
  LayoutDashboard,
  Menu,
  User,
  X,
  LogOut,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useAuth,
} from "../../context/AuthContext";

const navLinks = [
  {
    name: "Safari",
    path: "/#safari",
  },
  {
    name: "Stays",
    path: "/#stays",
  },
  {
    name: "Tours",
    path: "/#packages",
  },
  {
    name: "About",
    path: "/about",
  },
];

function Navbar() {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);


  const {
    user,
    logout,
  } = useAuth();

  const location = useLocation();

  const loginState = {
    from: location.pathname + location.search,
  };


  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-2"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-lg font-bold text-white">
            A
          </div>

          <div>

            <p className="text-lg font-bold tracking-tight">
              Ankit Tours
            </p>

            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Sawai Madhopur · Rajasthan
            </p>

          </div>

        </Link>


        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-8 md:flex">

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-neutral-700 transition hover:text-black"
            >
              {link.name}
            </Link>
          ))}

        </nav>


        {/* Desktop Actions */}

        <div className="hidden items-center gap-3 md:flex">

          {user ? (

            <>

              <Link
                to="/my-bookings"
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >

                <CalendarCheck size={17} />

                My Bookings

              </Link>


              {user.role === "admin" && (

                <Link
                  to="/admin"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >

                  <LayoutDashboard size={17} />

                  Admin Panel

                </Link>

              )}


              <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700">

                <User size={17} />

                Hi, {user.name.split(" ")[0]}

              </span>


              <button
                onClick={logout}
                className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Logout
              </button>

            </>

          ) : (

            <>

              <Link
                to="/login"
                state={loginState}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                <User size={17} />
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Sign Up
              </Link>

            </>

          )}

        </div>


        {/* Mobile */}

        <button
          onClick={() =>
            setMobileMenuOpen(
              !mobileMenuOpen,
            )
          }
          className="rounded-lg p-2 hover:bg-neutral-100 md:hidden"
          aria-label="Toggle menu"
        >

          {mobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}

        </button>

      </div>


      {/* Mobile menu */}

      {mobileMenuOpen && (

        <div className="border-t border-neutral-200 bg-white px-5 py-5 md:hidden">

          <nav className="flex flex-col gap-2">

            {navLinks.map((link) => (

              <Link
                key={link.path}
                to={link.path}
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="rounded-lg px-4 py-3 text-sm font-medium hover:bg-neutral-100"
              >
                {link.name}
              </Link>

            ))}


            <div className="mt-3 border-t border-neutral-200 pt-3">

              {user ? (

                <>

                  <Link
                    to="/my-bookings"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium hover:bg-neutral-100"
                  >

                    <CalendarCheck size={17} />

                    My Bookings

                  </Link>

                  {user.role === "admin" && (

                    <Link
                      to="/admin"
                      onClick={() =>
                        setMobileMenuOpen(false)
                      }
                      className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium hover:bg-neutral-100"
                    >

                      <LayoutDashboard size={17} />

                      Admin Panel

                    </Link>

                  )}

                  <span className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-neutral-700">



                    <User size={17} />

                    Hi, {user.name.split(" ")[0]}

                  </span>


                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="mt-2 flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium hover:bg-neutral-100"
                  >

                    <LogOut size={17} />

                    Logout

                  </button>

                </>

              ) : (

                <>

                  <Link
                    to="/login"
                    state={loginState}
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="block rounded-lg px-4 py-3 text-sm font-medium hover:bg-neutral-100"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="mt-2 block rounded-lg bg-black px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>

                </>

              )}

            </div>

          </nav>

        </div>

      )}

    </header>

      {/* Floating WhatsApp button.
          Keep this OUTSIDE the <header> above: the header uses
          backdrop-blur, which creates a containing block that traps
          `fixed` positioning and would pin this button to the navbar
          instead of the bottom-right of the screen. */}
      <a
        href={`https://wa.me/918741961756?text=${encodeURIComponent(
          "Hello Ankit, I am planning a trip to Sawai Madhopur/Ranthambore. My travel dates are ______ and we are ______ people. Please send me your tour options."
        )}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Ankit on WhatsApp"
        className="whatsapp-heartbeat fixed bottom-6 right-6 z-[60] inline-flex rounded-full"
      >
        <img
          src="/whatsapp-color-svgrepo-com.svg"
          alt="Chat with Ankit on WhatsApp"
          className="h-16 w-16 drop-shadow-lg"
        />
      </a>
    </>
  );
}

export default Navbar;