import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MainWindow } from "../components/MainWindow/MainWindow";

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <MainWindow />,
        },
    ],
    {
        basename: "/",
    }
);

export const AppRoutes = () => {
    return <RouterProvider router={router} />;
};