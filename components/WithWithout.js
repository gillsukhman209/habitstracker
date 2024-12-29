const WithWithout = () => {
  return (
    <section className="bg-base-100 text-lg">
      <div className="max-w-5xl mx-auto px-8 py-16 md:py-32 ">
        <h2 className="text-center font-extrabold text-3xl md:text-5xl tracking-tight mb-12 md:mb-20">
          Tired of building habits and never following through?
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 md:gap-12">
          {/* Left Column */}
          <div className="bg-error/20 text-error p-8 md:p-12 rounded-lg w-full flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-4">
              Building habits without 21 Habits
            </h3>

            <ul className="list-disc list-inside space-y-1.5 flex-1">
              {[
                "❌ No consequences for missing habits",
                "⏰ No reminders to stay consistent",
                "👥 No accountability for missed habits",
              ].map((item, index) => (
                <li key={index} className="flex gap-2 items-center">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column */}
          <div className="bg-success/20 text-success p-8 md:p-12 rounded-lg w-full flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-4">After using 21 Habits</h3>

            <ul className="list-disc list-inside space-y-1.5 flex-1">
              {[
                "💰 Laziness is punished with a charge",
                "🔔 Get reminders to stay on track",
                "📊 Visualize your progress and stay motivated",
              ].map((item, index) => (
                <li key={index} className="flex gap-2 items-center">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WithWithout;
