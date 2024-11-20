import {
  Outlet
} from "react-router-dom";
import NavBar from './components/NavBar'

export default function Layout() {
  return (
    <div>
      <NavBar></NavBar>
      <div>
        <Outlet />
      </div>
    </div>
  );
}