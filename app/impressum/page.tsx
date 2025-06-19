export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Impressum
          </h1>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Angaben gemäß § 5 TMG:
              </h2>
              
              <div className="space-y-2">
                <p>Munklär Meier</p>
                <p>Kleisterhain 69</p>
                <p>1337 Brügge</p>
                <p>Deutschland</p>
              </div>
              
              <div className="mt-4">
                <p>E-Mail: <a href="mailto:gigaSIGMAgrindsetALPHAacadamy@info.de" className="text-blue-600 dark:text-blue-400 hover:underline">gigaSIGMAgrindsetALPHAacadamy@info.de</a></p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Haftungsausschluss:
              </h2>
              <p className="leading-relaxed">
                Dies ist eine private, nicht-kommerzielle Website. Für Inhalte externer Links wird keine Haftung übernommen. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
