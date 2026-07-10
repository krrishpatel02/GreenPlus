import React from "react";
import { EcoProvider } from "./context/EcoContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <EcoProvider>
      <AppRoutes />
    </EcoProvider>
  );
}

export default App;