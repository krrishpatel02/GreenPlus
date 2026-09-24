import { EcoProvider } from "./context/EcoContext";
import { AssistantProvider } from "./context/AssistantContext";
import { AuthProvider } from "./context/AuthContext";
import { EcoProgressProvider } from "./context/EcoProgressContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <EcoProgressProvider>
        <NotificationProvider>
          <AssistantProvider>
            <EcoProvider>
              <AppRoutes />
            </EcoProvider>
          </AssistantProvider>
        </NotificationProvider>
      </EcoProgressProvider>
    </AuthProvider>
  );
}

export default App;