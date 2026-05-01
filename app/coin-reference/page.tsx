import CoinSpecimen from '../components/CoinSpecimen'

export default function CoinReferencePage() {
  return (
    <main className="specimen-page">
      <CoinSpecimen />
      <div className="specimen-label">
        <span>Exact asset</span>
        <strong>silver_coin.glb</strong>
        <em>No engraving. No color override.</em>
      </div>
    </main>
  )
}
