import {type RouteObject} from "react-router-dom";
import Layout from "./components/Layout";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const Routes:RouteObject[] = [
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/",
        element: <ProtectedRoute><Layout/></ProtectedRoute>
    }
]