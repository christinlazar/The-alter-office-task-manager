
    export default function NoResults() {
        return (
          <div className="flex min-h-[400px] w-full flex-col items-center justify-center p-4">
            <div className="mb-6 w-full max-w-[460px]">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-29%20130401-sU6kN0dXSm2ZdI1ALIdac0HoerKXdd.png"
                alt="No results found"
                className="h-auto w-full"
              />
            </div>
            <h2 className="text-center text-lg font-medium text-gray-600">
              It looks like we can&apos;t find any results that match.
            </h2>
          </div>
        )
      }
