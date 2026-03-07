import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { Routes } from "./Routes"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

const router = createBrowserRouter(Routes);
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}/>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
