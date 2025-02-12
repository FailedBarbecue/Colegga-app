import { cn } from "@/lib/utils"

export default function AppContainer ({ className, children }: {
  className?: string, children: React.ReactNode
}) {
  return (
    <div className={cn("bg-white rounded-xl shadow-lg mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  )
}
