import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="brand">QiOne Portal</div>
      <Link to="/">Dashboard</Link>
      <Link to="/timeline">Timeline</Link>
      <Link to="/household">Household</Link>
      <Link to="/tenants">Tenants</Link>
      <Link to="/cases">Cases</Link>
    </div>
  );
}
