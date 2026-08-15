import { useAuthRedirectHandler } from "./hooks/useAuthRedirectHandler";
import { useTenantConfig } from "./hooks/useTenantConfig";
import { LoginScreen } from "./features/Login";

function App() {
  const authStatus = useAuthRedirectHandler();
  const { config } = useTenantConfig("acme");

  return <LoginScreen />;
}

export default App;
