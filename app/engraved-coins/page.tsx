import EngravedCoinPreview from '../components/EngravedCoinPreview'

export default function EngravedCoinsPage() {
  return (
    <main className="specimen-page">
      <EngravedCoinPreview />
      <div className="specimen-label">
        <span>Generated assets</span>
        <strong>Governance / Execution / Strategy</strong>
        <em>Same coin, dark inset text preview.</em>
      </div>
    </main>
  )
}
