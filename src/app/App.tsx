import "bootstrap/dist/css/bootstrap.min.css";

import React from 'react';
import './App.css';

import {
    Link,
    Route,
    BrowserRouter, Routes, useLocation
} from "react-router-dom";

import {StructureDetailsView, StructureList} from "./pages";

function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/structures" element={<StructureList/>}/>
                <Route path="/structures/:id" element={<StructureDetailsView/>}/>
            </Routes>
        </BrowserRouter>
    );
}

function Navbar() {
    const location = useLocation()
    return (
        <>
            <nav className={"mt-2 d-flex justify-content-center"}>
                <Link className={"btn btn-lg m-2 " + (location.pathname === "/" ? "btn-success" : "btn-primary")} to="/">Scenariusze</Link>
                <Link className={"btn btn-lg m-2 " + (location.pathname.startsWith("/structures") ? "btn-success" : "btn-primary")} to="/structures">Struktury</Link>
            </nav>
            <hr/>
        </>
    );
}

export default App;
