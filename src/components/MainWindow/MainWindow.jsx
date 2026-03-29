import React, { useState } from "react";
import "./MainWindow.css";
import { CreateApplication } from "../CreateApplication/CreateApplication";
import { SignAgreement } from "../SignAgreement/SignAgreement";
import { Search } from "../Search/Search";

export const MainWindow = () => {
    const [activeComponent, setActiveComponent] = useState("create");

    const renderComponent = () => {
        switch (activeComponent) {
            case "create":
                return <CreateApplication />;
            case "sign":
                return <SignAgreement />;
            case "search":
                return <Search />;
            default:
                return <CreateApplication />;
        }
    };

    return (
        <>
            <div className="header">
                <div className="left-header">Credit Manager</div>
                <div className="right-header">
                    <button
                        className={`header-button ${activeComponent === "create" ? "active" : ""}`}
                        onClick={() => setActiveComponent("create")}
                    >
                        Оформить заявку
                    </button>
                    <button
                        className={`header-button ${activeComponent === "sign" ? "active" : ""}`}
                        onClick={() => setActiveComponent("sign")}
                    >
                        Подписать договор
                    </button>
                    <button
                        className={`header-button ${activeComponent === "search" ? "active" : ""}`}
                        onClick={() => setActiveComponent("search")}
                    >
                        Поиск
                    </button>
                </div>
            </div>

            <main className="content">
                {renderComponent()}
            </main>
        </>
    );
};