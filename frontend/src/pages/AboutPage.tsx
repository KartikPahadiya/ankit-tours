import type { SyntheticEvent } from "react";
import { MapPin } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const WHY_TRAVEL = [
  {
    title: "Local Knowledge",
    text: "Discover Sawai Madhopur through someone who knows the local area.",
  },
  {
    title: "Personal Experience",
    text: "Small-group and personalised experiences rather than a generic tour.",
  },
  {
    title: "Authentic Culture",
    text: "See local life, food, traditions and rural Rajasthan respectfully.",
  },
  {
    title: "Easy Communication",
    text: "Simple English communication through WhatsApp.",
  },
  {
    title: "Flexible Itineraries",
    text: "Build your trip around your dates, interests and budget.",
  },
];

function AboutPage() {
  // Hide the photo gracefully until ankit.jpg is added to
  // frontend/public/ — avoids a broken-image icon.
  const hideMissingPhoto = (
    event: SyntheticEvent<HTMLImageElement>,
  ) => {
    event.currentTarget.style.display = "none";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10">
          {/* Heading row — passport-size photo beside the
              heading on smartphones */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
                About Ankit
              </p>

              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Meet Your Local Host
              </h1>
            </div>

            <img
              src="/ankit.jpg"
              alt="Ankit, your local host"
              onError={hideMissingPhoto}
              className="h-24 w-20 shrink-0 rounded-xl object-cover shadow-md sm:hidden"
            />
          </div>

          {/* Text + large photo on the right (desktop) */}
          <div className="mt-6 sm:mt-8 sm:flex sm:items-start sm:gap-10">
            <div className="sm:flex-1">
              <p className="max-w-3xl text-lg leading-8 text-gray-600">
                Namaste! I'm Ankit, a local host from Sawai Madhopur,
                Rajasthan. Ranthambore is more than a wildlife destination to
                me. It is a place of forests, forts, temples, villages,
                traditions and stories.
              </p>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
                I created Ankit Tours to help international travellers
                experience this side of Rajasthan in a friendly, respectful
                and personal way.
              </p>

              <p className="mt-6 max-w-3xl text-xl font-semibold text-gray-900">
                My goal is simple: to help you experience Rajasthan like a
                traveller — not just see it like a tourist.
              </p>

              <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2 text-sm font-medium text-gray-700">
                <MapPin size={16} />
                Sawai Madhopur, Rajasthan, India
              </p>
            </div>

            <img
              src="/ankit.jpg"
              alt="Ankit, your local host"
              onError={hideMissingPhoto}
              className="hidden w-full sm:block sm:aspect-[4/5] sm:w-80 sm:shrink-0 sm:rounded-2xl sm:object-cover sm:shadow-lg"
            />
          </div>
        </div>

        {/* Why Travel With Ankit */}
        <div className="rounded-2xl bg-neutral-50 p-8 sm:p-12">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
              Why Travel With Ankit?
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              A Local Host, Not a Tourist Trap
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_TRAVEL.map((item, index) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-sm font-bold text-white">
                  {index + 1}
                </span>

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AboutPage;
