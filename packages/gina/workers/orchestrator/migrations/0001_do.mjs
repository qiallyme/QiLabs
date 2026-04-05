export const migrations = {
  async up({ createDurableObject }) {
    await createDurableObject("OrchestratorState");
  }
};

