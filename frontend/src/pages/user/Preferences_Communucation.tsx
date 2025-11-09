import { useState } from "react"

export default function Preferences_Communucation() {
    const [blog, setBlog] = useState(false)
    const [newsletter, setNewsletter] = useState(false)

    return (
        <form className="space-y-4 text-sm bg-[#fcfcfc] border border-[#c7c7cc] rounded shadow-[0_0_3px_1px_rgba(0,0,0,0.2)] p-6">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={blog}
                    onChange={() => setBlog(!blog)}
                    className="w-4 h-4"
                />
                <label>Recevoir des articles de blog</label>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={() => setNewsletter(!newsletter)}
                    className="w-4 h-4"
                />
                <label>S'abonner à la newsletter</label>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Valider
            </button>
        </form>
    )
}
