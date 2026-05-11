import Sidebar from '../../components/layout/Sidebar';

export default function Dashboard() {
  return (
    <div className="page-container">
      <Sidebar />
      <div className="main-content">
        <h1>Dashboard</h1>
        <div className="glass-panel">
          <h2>Welcome to QiOne Portal</h2>
          <p>Select an option from the sidebar to manage your system.</p>
        </div>
      </div>
    </div>
  );
}
