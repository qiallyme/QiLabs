import { useState } from "react";

export default function useGoals(initialGoals = []) {
  const [goals, setGoals] = useState(initialGoals);

  const addGoal = (goal) => setGoals([...goals, goal]);
  const removeGoal = (index) =>
    setGoals(goals.filter((_, idx) => idx !== index));

  return { goals, addGoal, removeGoal };
}