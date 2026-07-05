import Image from 'next/image'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-purple-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="ProfimaxIA OS"
              width={60}
              height={60}
              className="rounded-xl"
            />
            <div className="absolute inset-0 rounded-xl animate-goldPulse opacity-60" />
          </div>
        </div>

        {/* Glass card */}
        <div className="glass-panel-strong rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
