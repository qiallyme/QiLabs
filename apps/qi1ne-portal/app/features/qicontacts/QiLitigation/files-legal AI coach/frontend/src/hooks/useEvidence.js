import { useState } from "react";

export default function useEvidence(initialEvidence = []) {
  const [evidence, setEvidence] = useState(initialEvidence);

  const addEvidence = (item) => setEvidence([...evidence, item]);
  const removeEvidence = (index) =>
    setEvidence(evidence.filter((_, idx) => idx !== index));

  return { evidence, addEvidence, removeEvidence };
}