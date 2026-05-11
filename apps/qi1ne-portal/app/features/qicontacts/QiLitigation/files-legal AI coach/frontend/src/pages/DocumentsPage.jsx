import React from "react";
import DocumentUpload from "../components/Documents/DocumentUpload";
import DocumentList from "../components/Documents/DocumentList";

const DocumentsPage = () => (
  <section>
    <h2>Documents</h2>
    <DocumentUpload />
    <DocumentList />
  </section>
);

export default DocumentsPage;