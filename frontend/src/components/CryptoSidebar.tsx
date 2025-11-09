// src/components/CryptoSidebar.tsx
import CryptoNav from "./CryptoNav"
import "../assets/CardCrypto.css"

type CryptoSidebarProps = {
  service: "confidentiality" | "integrity" | "authenticity" | "non-repudiation" | "keys" | "algorithmes"
}

export default function CryptoSidebar({ service }: CryptoSidebarProps) {
  return (
    <div className="col-menu">
      <div className="block-account">
        <div className="block-avatar">
          <div className="avatarCtnr">
            <img
              className="imageProfilUrl"
              src="/admin.jpg"
              alt="Avatar"
              width="135"
              height="135"
            />
          </div>
        </div>
      </div>

      <CryptoNav service={service} />
    </div>
  )
}
