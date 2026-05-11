import { useState } from "react";

export default function useTimeline(initialSteps = []) {
  const [steps, setSteps] = useState(initialSteps);

  const addStep = (step) => setSteps([...steps, step]);
  const removeStep = (index) =>
    setSteps(steps.filter((_, idx) => idx !== index));

  return { steps, addStep, removeStep };
}