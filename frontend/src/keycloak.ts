import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: 'http://localhost:8080/', // URL du server Keycloak
    realm: 'crypto-platform',      // Nom du Realm
    clientId: 'react-app',   // ID du client
})

export default keycloak
