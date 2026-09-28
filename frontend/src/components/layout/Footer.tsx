import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-black">
                A
              </div>

              <span className="text-lg font-bold">Ankit Tours</span>
            </Link>

            <p className="mt-2 text-xs uppercase tracking-widest text-neutral-500">
              Sawai Madhopur • Ranthambore • Rajasthan
            </p>

            <p className="mt-5 max-w-xs text-sm leading-6 text-neutral-400">
              Wildlife | Heritage | Village Experiences | Local Culture —
              discover the real Rajasthan with a local host.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/itz__ankit_k__/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-neutral-700 p-2.5 transition hover:bg-neutral-800"
                aria-label="Instagram"
              >
                <Instagram size={17} />
              </a>

              <a
                href="https://wa.me/918741961756"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-neutral-700 p-2.5 transition hover:bg-neutral-800"
                aria-label="WhatsApp"
              >
                <img
                  src="/whatsapp-color-svgrepo-com.svg"
                  alt="WhatsApp"
                  className="h-[17px] w-[17px]"
                />
              </a>

              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=ankitkhatik2002@gmail.com&su=Enquiry for Ranthambore Trip"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-neutral-700 p-2.5 transition hover:bg-neutral-800"
                aria-label="Email"
              >
                <Mail size={17} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold">Explore</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-neutral-400">
              <Link to="/#safari" className="hover:text-white">
                Safari
              </Link>

              <Link to="/#stays" className="hover:text-white">
                Stays
              </Link>

              <Link to="/#packages" className="hover:text-white">
                Tours
              </Link>

              <Link to="/about" className="hover:text-white">
                About
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold">Support</h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-neutral-400">
              <Link to="/faq" className="hover:text-white">
                FAQs
              </Link>

              <Link to="/terms" className="hover:text-white">
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold">Contact Ankit</h3>

            <div className="mt-5 flex flex-col gap-4 text-sm text-neutral-400">
              <div className="flex items-center gap-3">
                <Phone size={17} />
                <a href="tel:+918741961756" className="hover:text-white">
                  +91 87419 61756
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={17} />
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=ankitkhatik2002@gmail.com&su=Enquiry for Ranthambore Trip"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  ankitkhatik2002@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-6 text-center">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Ankit Tours. All rights reserved.
          </p>

          <p className="mx-auto mt-3 max-w-3xl text-xs leading-5 text-neutral-600">
            Ankit Tours is an independent local travel/experience service.
            Park entry, safari permits and other regulated services are
            subject to the rules and availability of the relevant
            authorities.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
