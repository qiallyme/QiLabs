import React from "react";
import EvidenceUpload from "../components/Evidence/EvidenceUpload";
import EvidenceList from "../components/Evidence/EvidenceList";

const EvidencePage = () => (
  <section>
    <h2>Evidence</h2>
    <EvidenceUpload />
    <EvidenceList />
  </section>
);

export default EvidencePage;