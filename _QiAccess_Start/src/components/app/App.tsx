import { RouterProvider } from "react-router-dom";
import { FeedbackProvider } from "../feedback/FeedbackProvider";
import { RegistryProvider } from "../../features/resources/registry-store";
import { router } from "./routes";

export function App() {
  return (
    <FeedbackProvider>
      <RegistryProvider>
        <RouterProvider router={router} />
      </RegistryProvider>
    </FeedbackProvider>
  );
}
