export default function Parametres_Securite() {
    return (
        <form className="space-y-4 text-sm bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)] p-6">
            <div>
                <label className="block font-medium">Mot de passe actuel</label>
                <input type="password" className="mt-1 w-full border rounded px-3 py-2" />
            </div>

            <div>
                <label className="block font-medium">Nouveau mot de passe</label>
                <input type="password" className="mt-1 w-full border rounded px-3 py-2" />
            </div>

            <div>
                <label className="block font-medium">Confirmer le mot de passe</label>
                <input type="password" className="mt-1 w-full border rounded px-3 py-2" />
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Valider
            </button>
        </form>
    )
}
