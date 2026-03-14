import {type RouteObject} from "react-router-dom";
import Layout from "./components/Layout";
import { PublicLayout } from "./components/PublicLayout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Hero } from "./pages/Hero";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {Dashboard} from "./pages/Dashboard";
import { TransactionsPage } from "./pages/TransactionsPage";
import { AccountsPage } from "./pages/AccountsPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
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
        element: <ProtectedRoute><Layout/></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Dashboard/>
            },
            {
                path: "transactions",
                element: <TransactionsPage/>
            },
            {
                path: "accounts",
                element: <AccountsPage/>
            },
            {
                path: "budgets",
                element: <BudgetsPage/>
            },
            {
                path: "settings",
                element: <SettingsPage/>
            },
        ]
    },
    {
        path: "*",
        element: <NotFoundPage/>
    }
]