import "./Navbar.css";
import logo from "../assets/logo.png";
import Button_link from "./Button_link";

function Navbar() {
  return (
    <nav className="navbar">
      <div class="navbar-logo-text">
        <img src={logo} alt="logo" className="navbar-logo" />
        <div class="content">
          <a className="navbar-text" href="/">
            CodeClock
            <div class="aurora">
              <div class="aurora__item"></div>
              <div class="aurora__item"></div>
              <div class="aurora__item"></div>
              <div class="aurora__item"></div>
            </div>
          </a>
        </div>
      </div>
      <ul className="navbar-links">
        <Button_link href="/">Home</Button_link>
        <Button_link href="/">About</Button_link>
        <Button_link href="/">Contact</Button_link>
      </ul>
    </nav>
  );
}

export default Navbar;
