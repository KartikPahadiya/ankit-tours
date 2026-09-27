import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Is Ankit Tours a safari operator?",
    answer:
      "We can help you plan and coordinate your Ranthambore experience. Safari permits and park access are subject to the applicable official forest department rules and availability.",
  },
  {
    question: "Can you pick us up from the railway station?",
    answer:
      "Yes — railway-station pickup and drop can be arranged depending on the selected package.",
  },
  {
    question: "Can you arrange hotels?",
    answer:
      "Yes, hotel options can be included in a customised quotation, from budget to premium categories.",
  },
  {
    question: "What is included in the package price?",
    answer:
      "Depending on your selected package, we typically include a local host, itinerary planning, local sightseeing, the village experience, fort/heritage visits, railway station pickup/drop, local transport arrangement, food experience where selected, and photography assistance. Flights, personal expenses, travel insurance, government/park fees where applicable, safari permit/vehicle charges (unless specifically included) and hotel upgrades are not always included — your final written quotation will clearly show what applies to your booking.",
  },
  {
    question: "Can foreigners join the village experience?",
    answer:
      "Yes, where the experience is available. Village visits should always respect local residents, privacy and permission.",
  },
  {
    question: "Can you arrange vegetarian or special food?",
    answer:
      "Yes — tell us your dietary requirements before booking and the food experience will be arranged accordingly.",
  },
  {
    question: "Can I customise the itinerary?",
    answer:
      "Absolutely. Tell us what you want to see and how many days you have, and we'll build a personalised plan around it.",
  },
];

function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
            FAQs
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h1>

          <p className="mt-2 text-lg text-gray-600">
            Everything you need to know about travelling with Ankit Tours.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                {faq.question}
              </summary>

              <p className="mt-3 leading-relaxed text-neutral-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FaqPage;
