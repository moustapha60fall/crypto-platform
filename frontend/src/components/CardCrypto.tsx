// src/components/CardSystem.tsx
import '../assets/CardCrypto.css'

import { NavLink } from "react-router-dom";

export function CardCrypto() {
    return (
        <div className="container-ep">
            <div className="colCtnr">
                <div className="col-menu">
                    <div className="block-account">
                        <div className="block-avatar">
                            <div className="avatarCtnr">
                                <img className="imageProfilUrl" src="admin.jpg" alt="Avatar" width="135" height="135" />
                            </div>
                        </div>
                    </div>
                    <nav>
                        <ul className="menu-left">
                            <li><NavLink to="" className="ep">Mes alertes</NavLink></li>
                            <li><NavLink to="/home/client/details/profil" className="ep selected">Mon profil</NavLink></li>
                            <li><NavLink to="#" className="red">URGENT, Mon profil</NavLink></li>
                            <li><NavLink to="#" className="red">mon profil</NavLink></li>
                            <li><NavLink to="#" className="red">mon profil</NavLink></li>
                            <li><NavLink to="#" id="SimulerMonFinancement" className="red" target="_blank">mon profil</NavLink></li>
                            <li className="app">
                                <span>Info Utilisateurs </span>
                                <NavLink to="/admin" className="android"></NavLink>
                                <NavLink to="/admin" className="apple"></NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

    )
}
