import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h1>HR Survey</h1>
        <nav>
          <NavLink to="/admin" end>
            Все опросы
          </NavLink>
          <NavLink to="/admin/surveys/new">
            Создать опрос
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
