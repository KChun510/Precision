"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./header.css");
function Header() {
    return (<>
        <nav className="navbar navbar-expand-lg navbar-light bg-light" id='main_header'>
        <a className="navbar-brand" id="header_title" href="#">Precision 🎯</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav mr-auto">
            <li className="nav-item active">
                <a className="nav-link" href="#">Home <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">About</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">Tech</a>
            </li>
            </ul>
            <span className="navbar-text">
            
            </span>
        </div>
        </nav>
        </>);
}
exports.default = Header;
