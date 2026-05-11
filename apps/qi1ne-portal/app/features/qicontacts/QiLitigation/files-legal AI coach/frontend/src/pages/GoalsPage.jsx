import React from "react";
import GoalsList from "../components/Goals/GoalsList";
import AddGoalForm from "../components/Goals/AddGoalForm";

const GoalsPage = () => (
  <section>
    <h2>Goals</h2>
    <AddGoalForm />
    <GoalsList />
  </section>
);

export default GoalsPage;