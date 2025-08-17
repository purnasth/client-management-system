import { ApiProvider } from "./providers/ApiProvider";
import { DomainList } from "./components/DomainList";

const App = () => (
  <ApiProvider>
    <DomainList />
  </ApiProvider>
);

export default App;
