import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import { useAuth } from "../context/AuthContext";
import { createRequest } from "../services/requestService";
import { consumePendingRequest, savePendingRequest } from "../utils/pendingRequest";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue, Option } from "@/components/ui/select";

import { getPackages, type TourPackage } from "../services/packageService";

/*
  Tailwind cannot generate classes from runtime strings, so each color
  maps to complete, literal class names that exist in this source file.
*/
const COLOR_STYLES: Record<
  string,
  {
    price: string;
    duration: string;
    button: string;
    badge: string;
    dot: string;
  }
> = {
  orange: {
    price: "text-orange-600",
    duration: "text-orange-500",
    button: "bg-orange-600 hover:bg-orange-700",
    badge: "bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  red: {
    price: "text-red-600",
    duration: "text-red-500",
    button: "bg-red-600 hover:bg-red-700",
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  amber: {
    price: "text-amber-600",
    duration: "text-amber-500",
    button: "bg-amber-600 hover:bg-amber-700",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  emerald: {
    price: "text-emerald-600",
    duration: "text-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  blue: {
    price: "text-blue-600",
    duration: "text-blue-500",
    button: "bg-blue-600 hover:bg-blue-700",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  purple: {
    price: "text-purple-600",
    duration: "text-purple-500",
    button: "bg-purple-600 hover:bg-purple-700",
    badge: "bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
};

const FALLBACK_STYLE = COLOR_STYLES.orange;

export const TourPackages: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [guests, setGuests] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    async function loadPackages() {
      try {
        const data = await getPackages();
        setPackages(data);
      } catch {
        setError("Unable to load tour packages right now.");
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, []);

  // Restore a half-filled booking if the user was sent to log in first.
  useEffect(() => {
    const pending = consumePendingRequest();
    if (pending?.type === "package") {
      setSelectedPackage(pending.packageId);
      setSelectedDate(pending.date || null);
      setGuests(pending.guests);
    }
  }, []);

  const selected = packages.find(
    (pkg) => pkg.id === selectedPackage
  );

  const handleBookPackage = async () => {
    if (!selectedPackage || !selectedDate) {
      setError("Please select a travel date first.");
      return;
    }

    if (!user) {
      savePendingRequest({
        type: "package",
        packageId: selectedPackage,
        date: selectedDate,
        guests,
      });
      navigate("/login", { state: { from: "/tour-packages" } });
      return;
    }

    // Record the request on the website first so Ankit can
    // accept it in the admin panel (and the user can pay
    // online once accepted); then open the WhatsApp chat.
    try {
      await createRequest({
        type: "package",
        item_id: selectedPackage,
        check_in: selectedDate,
        rooms: guests,
      });
    } catch {
      // Even if the request fails to save, the WhatsApp
      // message still goes through.
    }

    const selected = packages.find(
      (pkg) => pkg.id === selectedPackage
    );

    const lines = [
      "Hi, I'd like to book a tour package.",
      `• Package: ${selected ? `${selected.icon} ${selected.title} (${selected.duration})` : `#${selectedPackage}`}`,
      `• Travel date: ${selectedDate}`,
      `• Guests: ${guests}`,
    ];

    window.open(
      `https://wa.me/918741961756?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank"
    );

    setSelectedPackage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
            Tour Packages
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Curated Ranthambore Experiences
          </h1>

          <p className="mt-2 text-lg text-gray-600">
            Perfectly crafted combinations of wildlife safaris and comfortable
            stays for an unforgettable journey.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading packages...
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => {
              const styles = COLOR_STYLES[pkg.color] || FALLBACK_STYLE;

              return (
                <Card key={pkg.id} className="h-full border">
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <span className="text-3xl font-bold">{pkg.icon}</span>
                      </div>
                      <div className="flex-1">
                        <CardTitle>{pkg.title}</CardTitle>
                        <p className={`text-sm ${styles.duration}`}>
                          {pkg.duration}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className={`text-lg font-medium ${styles.price}`}>
                      ₹{Number(pkg.price).toLocaleString("en-IN")}
                      {pkg.price_type === "perPerson" ? " / person" : ""}
                    </p>

                    {pkg.description && (
                      <p className="mt-2 text-sm text-gray-500">
                        {pkg.description}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      {pkg.includes.map((include) => (
                        <span
                          key={include}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${styles.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                          />
                          {include}
                        </span>
                      ))}
                    </div>
                  </CardFooter>

                  <CardFooter className="border-t pt-4">
                    <Button
                      onClick={() => {
                        setSelectedPackage(pkg.id);
                        setError("");
                      }}
                      className={`w-full px-4 py-2.5 text-sm font-medium text-white transition ${styles.button}`}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Package selector modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle>Select Your Dates</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-4 text-sm text-gray-500">
                {selected.icon} {selected.title} — {selected.duration}
              </p>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Travel Date
                </label>
                <Input
                  type="date"
                  value={selectedDate || ""}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Number of Guests
                </label>
                <Select onValueChange={(value) => setGuests(Number(value))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`${guests} guest${guests !== 1 ? "s" : ""}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <Option value={1}>1 guest</Option>
                    <Option value={2}>2 guests</Option>
                    <Option value={3}>3 guests</Option>
                    <Option value={4}>4 guests</Option>
                    <Option value={5}>5+ guests</Option>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 border-t pt-6">
              <Button
                onClick={() => setSelectedPackage(null)}
                className="px-4 py-2.5 text-sm text-gray-500 transition hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookPackage}
                className="bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
              >
                Book This Package
              </Button>
            </CardFooter>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TourPackages;
