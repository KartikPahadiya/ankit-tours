import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "1. Bookings",
    paragraphs: [
      "All bookings — safaris, stays and tour packages — are confirmed only after we verify availability and receive payment or a booking confirmation from our team. Enquiries sent through the website or WhatsApp are requests, not confirmed bookings, until we confirm them in writing.",
      "Prices shown on the website are in Indian Rupees (INR) and may change without notice. The price applicable to your booking is the one confirmed at the time of booking.",
    ],
  },
  {
    title: "2. Payments",
    paragraphs: [
      "Online payments are processed through Razorpay. We do not store your card or banking details on our servers.",
      "Booking amounts, taxes and permit fees are shown before you pay. Where forest department permit fees apply (for example, safari permits), they are charged at actuals.",
    ],
  },
  {
    title: "3. Inclusions and exclusions",
    paragraphs: [
      "Depending on your selected package, your experience typically includes: a local host, itinerary planning, local sightseeing, the village experience, fort/heritage visits, railway station pickup/drop, local transport arrangement, food experience where selected, and photography assistance.",
      "Not always included: flights, personal expenses, travel insurance, government/park fees where applicable, safari permit/vehicle charges unless specifically included, and hotel upgrades.",
      "A final written quotation will clearly show the inclusions and exclusions that apply to your booking.",
    ],
  },
  {
    title: "4. Cancellations and refunds",
    paragraphs: [
      "Stay and package bookings may be cancelled or rescheduled; the refund amount depends on how far before the check-in date you inform us.",
      "Safari permits are issued by the Rajasthan forest department under their rules and are generally non-refundable and non-transferable once issued. If a safari is cancelled by the forest department or due to park closure, we will assist with rescheduling or a refund of our service portion.",
      "Approved refunds are returned to the original payment method and can take 5–10 working days to reflect, depending on your bank.",
    ],
  },
  {
    title: "5. Safari permits and park rules",
    paragraphs: [
      "A government photo ID is mandatory for every guest before a safari permit can be issued. Zone allocation is decided by the forest department and cannot be guaranteed or chosen.",
      "Inside the park, guests must follow all rules and the guide's instructions: remain seated in the vehicle, do not feed or disturb wildlife, no littering, and no loud noise. The park authorities may deny entry or end a safari for rule violations without refund.",
    ],
  },
  {
    title: "6. Liability",
    paragraphs: [
      "Ranthambore is a natural habitat and wildlife sightings — including tigers — cannot be guaranteed. Safaris, drives and nature walks are undertaken at the guest's own risk.",
      "We are not liable for delays, cancellations or losses caused by factors beyond our control, including weather, park closures, vehicle breakdowns, or changes in government rules. We will always do our best to offer suitable alternatives.",
    ],
  },
  {
    title: "7. Website content",
    paragraphs: [
      "Descriptions, photographs and package details on this website are for information purposes. Accommodation images are representative; actual rooms and views may vary.",
    ],
  },
  {
    title: "8. Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. The version in force is the one published on this page at the time of your booking. Continuing to use the website after changes are made means you accept the updated terms.",
    ],
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
            Legal
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Terms & Conditions
          </h1>

          <p className="mt-2 text-lg text-gray-600">
            Please read these terms carefully before making a booking with
            us.
          </p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h2>

              <div className="mt-3 space-y-3 leading-relaxed text-neutral-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TermsPage;
