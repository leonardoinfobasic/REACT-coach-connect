import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { ThemeProvider } from "@/components/theme-provider"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="coach-connect-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)