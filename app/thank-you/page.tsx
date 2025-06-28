// app/thank-you/page.tsx
export default function ThankYouPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#eef4ff] font-poppins">
      <div className="text-center p-6 bg-white shadow-xl rounded-2xl max-w-md">
        <h1 className="text-3xl font-bold text-green-600 mb-2">🎉 Payment Successful!</h1>
        <p className="text-gray-700 mb-4">
          Thank you for purchasing Premium Counselling. We’ve received your payment and you’ll get guidance soon.
        </p>
        <a
          href="/counselling/premium"
          className="inline-block mt-4 bg-[#4300FF] text-white px-6 py-2 rounded-lg hover:bg-[#2e00aa] transition"
        >
          Enjoy Your Premium Counselling!!!
        </a>
      </div>
    </main>
  );
}
