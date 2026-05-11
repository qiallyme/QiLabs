import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/goals">Goals</Link></li>
        <li><Link to="/timeline">Timeline</Link></li>
        <li><Link to="/documents">Documents</Link></li>
        <li><Link to="/chats">Chats</Link></li>
        <li><Link to="/evidence">Evidence</Link></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;