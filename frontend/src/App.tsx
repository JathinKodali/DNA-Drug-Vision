import { useState } from "react";
import Layout from "./components/Layout";
import CellLinePredictor from "./components/CellLinePredictor";
import CustomDNAPredictor from "./components/CustomDNAPredictor";
import HomePage from "./components/HomePage";

function App() {
  const [activeMode, setActiveMode] = useState<"home" | "cellline" | "dna">("home");

  if (activeMode === "home") {
    return <HomePage onNavigate={(mode) => setActiveMode(mode as any)} />;
  }

  return (
    <Layout activeMode={activeMode} setActiveMode={setActiveMode as any}>
      {activeMode === "cellline" ? <CellLinePredictor /> : <CustomDNAPredictor />}
    </Layout>
  );
}

export default App;
