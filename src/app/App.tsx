import "bootstrap/dist/css/bootstrap.min.css";

import React from 'react';
import './App.css';

import {
    Link,
    Route,
    BrowserRouter, Routes, useLocation
} from "react-router-dom";

import {ScenarioDetailsView, ScenarioList, ScenarioStepView, StructureDetailsView, StructureList} from "./pages";

function App() {
    return (
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/scenarios" element={<ScenarioList/>}/>
                <Route path="/scenarios/:id" element={<ScenarioDetailsView/>}/>
                <Route path="/scenarios/steps/:id" element={<ScenarioStepView/>}/>
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
                <Link className={"btn btn-lg m-2 " + (location.pathname === "/" ? "btn-success" : "btn-primary")} to="/">Home</Link>
                <Link className={"btn btn-lg m-2 " + (location.pathname.startsWith("/scenarios") ? "btn-success" : "btn-primary")} to="/scenarios">Scenariusze</Link>
                <Link className={"btn btn-lg m-2 " + (location.pathname.startsWith("/structures") ? "btn-success" : "btn-primary")} to="/structures">Struktury</Link>
            </nav>
            <hr/>
        </>
    );
}

export default App;
