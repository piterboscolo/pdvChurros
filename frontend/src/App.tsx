import { Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { KitchenPage } from "./pages/KitchenPage";
import { PdvPage } from "./pages/PdvPage";
import { SalesPage } from "./pages/SalesPage";
import { TablesPage } from "./pages/TablesPage";
import { TabsPage } from "./pages/TabsPage";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<PdvPage />} />
        <Route path="/mesas" element={<TablesPage />} />
        <Route path="/comandas" element={<TabsPage />} />
        <Route path="/vendas" element={<SalesPage />} />
        <Route path="/cozinha" element={<KitchenPage />} />
      </Routes>
    </AppShell>
  );
}
