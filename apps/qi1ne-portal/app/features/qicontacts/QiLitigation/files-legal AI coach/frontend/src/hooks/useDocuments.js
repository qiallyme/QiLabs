import { useState } from "react";

export default function useDocuments(initialDocuments = []) {
  const [documents, setDocuments] = useState(initialDocuments);

  const addDocument = (doc) => setDocuments([...documents, doc]);
  const removeDocument = (index) =>
    setDocuments(documents.filter((_, idx) => idx !== index));

  return { documents, addDocument, removeDocument };
}