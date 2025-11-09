
export default function AuthenticityIndex() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-4">Service d’Authenticité</h1>
        <p className="text-muted-foreground">
          Générez des MACs et des signatures numériques pour garantir l’origine des données.
        </p>
      </div>
    </div>
  )
}
