import { Loader2 } from "lucide-react"

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="mt-4 text-xl font-semibold">Caricamento...</h2>
      </div>
    </div>
  )
}

export default LoadingScreen
