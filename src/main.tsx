import { createRoot } from "react-dom/client"
import "./index.css"

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./providers/authProvider";

import { Routes } from "./Routes"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

const router = createBrowserRouter(Routes);
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router}/>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
)
