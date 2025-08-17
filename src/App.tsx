import { ApiProvider } from "./providers/ApiProvider";
import Dashboard from "./pages/Dashboard";

const App = () => (
  <ApiProvider>
    <Dashboard />
  </ApiProvider>
);

export default App;
