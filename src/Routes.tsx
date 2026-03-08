import {type RouteObject} from "react-router-dom";
import Layout from "./components/Layout";
import { PublicLayout } from "./components/PublicLayout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Hero } from "./pages/Hero";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const Routes:RouteObject[] = [
    {
        path: "/",
        element: <PublicLayout/>,
        children: [
            {
                index: true,
                element: <Hero/>
            },
            {
                path: "login",
                element: <Login/>
            },
            {
                path: "register",
                element: <Register/>
            }
        ]
    },
    {
        path: "/app",
        element: <ProtectedRoute><Layout/></ProtectedRoute>
    }
]