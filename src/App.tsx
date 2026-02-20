import { Header } from './components/header';
import { ScenariosTable } from './components/scenarios-table';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <ScenariosTable />
      </main>
    </div>
  );
}