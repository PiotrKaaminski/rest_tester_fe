import "bootstrap/dist/css/bootstrap.min.css";

import React from 'react';
import './App.css';

import {
    Link,
    Route,
    BrowserRouter, Routes, useLocation
} from "react-router-dom";

import {
    ExecutionDetailsView,
    ExecutionList, ExecutionStepView,
    ScenarioDetailsView,
    ScenarioList,
    ScenarioStepView,
    StructureDetailsView,
    StructureList
} from "./pages";

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
                <Route path="/" element={<ExecutionList/>}/>
                <Route path="/executions/:id" element={<ExecutionDetailsView/>}/>
                <Route path="/executions/steps/:id" element={<ExecutionStepView/>}/>
            </Routes>
        </BrowserRouter>
    );
}

function Navbar() {
    const location = useLocation()
    return (
        <>
            <nav className={"mt-2 d-flex justify-content-center"}>
                <Link className={"btn btn-lg m-2 " + (location.pathname === "/" || location.pathname.startsWith("/executions") ? "btn-success" : "btn-primary")} to="/">Testy</Link>
                <Link className={"btn btn-lg m-2 " + (location.pathname.startsWith("/scenarios") ? "btn-success" : "btn-primary")} to="/scenarios">Scenariusze</Link>
                <Link className={"btn btn-lg m-2 " + (location.pathname.startsWith("/structures") ? "btn-success" : "btn-primary")} to="/structures">Struktury</Link>
            </nav>
            <hr/>
        </>
    );
}

export default App;
