import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import QiHome from "../modules/qihome";
import QiChronicle from "../modules/qichronicle";

export default function ModuleRouter() {
    return (
        <Routes>
            <Route path="/qihome/*" element={<QiHome />} />
            <Route path="/qichronicle/*" element={<QiChronicle />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
