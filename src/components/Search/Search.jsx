import "./Search.css"
import React, {useState} from "react";
import {FindClients} from "./FindClients/FindClients";
import {FindApplications} from "./FindApplications/FindApplications";
import {FindAgreements} from "./FindAgreements/FindAgreements";

export const Search = () => {
    const [activeComponent, setActiveComponent] = useState("clients");

    const renderComponent = () => {
        switch (activeComponent) {
            case "clients":
                return <FindClients />;
            case "applications":
                return <FindApplications />;
            case "agreements":
                return <FindAgreements />;
            default:
                return <FindClients />;
        }
    };

    return (
        <>
            <div className="second-header">
                <button
                    className={`header-button ${activeComponent === "clients" ? "active" : ""}`}
                    onClick={() => setActiveComponent("clients")}
                >
                    Клиенты
                </button>
                <button
                    className={`header-button ${activeComponent === "applications" ? "active" : ""}`}
                    onClick={() => setActiveComponent("applications")}
                >
                    Заявки
                </button>
                <button
                    className={`header-button ${activeComponent === "agreements" ? "active" : ""}`}
                    onClick={() => setActiveComponent("agreements")}
                >
                    Договора
                </button>
            </div>

            <main className="content">
                {renderComponent()}
            </main>
        </>
    )
}