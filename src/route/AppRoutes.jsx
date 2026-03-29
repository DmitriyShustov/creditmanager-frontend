import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MainWindow } from "../components/MainWindow/MainWindow";

const router = createBrowserRouter(
    {
        basename: "/",
    }
);

export const AppRoutes = () => {
    return <RouterProvider router={router} />;
};