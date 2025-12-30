
import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 flex justify-center items-start pt-20">
      <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 p-8 shadow-2xl rounded-xl">
        <h1 className="text-3xl font-bold mb-2 text-cyan-400">Privacy Policy</h1>
        <p className="text-gray-500 mb-6">Last Updated: December 30, 2025</p>

        <div className="h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2>
              <p>DecisionLens AI respects your privacy and is committed to protecting your strategic data. This Privacy Policy explains how we handle your information when you use our Enterprise Decision Support System.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">2. Data We Collect</h2>
              <p>We believe in data minimization. The Platform collects:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                 <li><strong>Local Decision Data:</strong> Inputs, criteria, and simulation results stored in your local database.</li>
                 <li><strong>Authentication Data:</strong> Hashed passwords and session tokens (Local/JWT).</li>
                 <li><strong>Telemetry (Optional):</strong> Anonymized usage statistics if opt-in is enabled.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">3. How We Use Your Data</h2>
              <p>Your data is used exclusively to:</p>
               <ul className="list-disc pl-5 mt-2 space-y-1">
                 <li>Provide and maintain the DecisionLens AI service.</li>
                 <li>Execute Monte Carlo simulations and neural forecasts.</li>
                 <li>Authenticate your access to the secure workspace.</li>
              </ul>
              <p className="mt-2">We do <strong>not</strong> sell, trade, or rent your strategic data to third parties.</p>
            </section>
            
             <section>
              <h2 className="text-xl font-semibold text-white mb-2">4. Third-Party LLMs</h2>
              <p>When you use AI reasoning features, specific prompts are sent to the configured LLM provider (e.g., OpenAI, Anthropic). These providers do not use your data for training their models when accessed via our Enterprise API integration, in accordance with their respective data usage policies.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-2">5. Data Retention</h2>
              <p>Since DecisionLens AI runs primarily on your infrastructure (&quot;Native Mode&quot;), you have full control over data retention. You can backup, export, or permanently delete your data at any time using the platform&apos;s administrative tools.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
