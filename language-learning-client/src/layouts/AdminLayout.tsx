import React from "react";
import { Outlet } from "react-router-dom";

export const AdminLayout: React.FC = () => {
    return (
        <div className="container mx-auto p-6 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">
                Admin Dashboard
            </h1>
            <main>
                <Outlet />
            </main>
        </div>
    )
}