import MacroRing from "./MacroRing"

export default function ResultCard({ result, preview, remaining, onReset }) {
  const { food, identified_food, confidence, nutrition = {}, advice, safe, alert } = result

  const name = identified_food || food
  const confidencePct = Math.round((confidence || 0) * 100)
  const cal = Math.round(nutrition.calories || 0)
  const carbs = nutrition.carbs || 0
  const fat = nutrition.fat || 0
  const protein = nutrition.protein || 0
  const showClassified =
    food && identified_food && food.toLowerCase() !== identified_food.toLowerCase()
  const over = remaining < 0

  return (
    <section className="result">
      <div className="plate-scene">
        <div className="plate">
          <MacroRing carbs={carbs} fat={fat} protein={protein} />
          {preview && <img className="plate-photo" src={preview} alt={name} />}
        </div>
        <button className="ghost-btn" onClick={onReset}>Nouvelle photo</button>
      </div>

      <div className="result-info">
        <p className="eyebrow">Analyse</p>
        <h2 className="dish-name">{name}</h2>
        <p className="dish-meta">
          {confidencePct > 0 ? `${confidencePct}% sûr` : "estimation"}
          {showClassified && <span className="dish-classified"> · classé {food}</span>}
        </p>

        {!safe && alert ? (
          <div className="alert">⚠️ {alert}</div>
        ) : (
          <p className="safe-note">Aucun allergène détecté pour vous</p>
        )}

        <div className="total">
          <span className="total-num">{cal}</span>
          <span className="total-label">kcal au total</span>
        </div>

        <div className="macros">
          <Macro color="safran" label="Glucides" value={carbs} />
          <Macro color="tomate" label="Lipides" value={fat} />
          <Macro color="creme" label="Protéines" value={protein} />
        </div>

        <p className={`budget ${over ? "over" : ""}`}>
          {over
            ? `Tu as dépassé ta cible de ${Math.abs(remaining)} kcal aujourd'hui`
            : `Il te reste ${remaining} kcal aujourd'hui`}
        </p>
      </div>

      {advice && (
        <div className="advice-panel">
          <p className="advice-eyebrow">Le conseil</p>
          <p className="advice-text">{advice}</p>
        </div>
      )}
    </section>
  )
}

function Macro({ color, label, value }) {
  return (
    <div className="macro">
      <span className={`dot ${color}`} />
      <span className="macro-label">{label}</span>
      <span className="macro-value">{Math.round(value * 10) / 10} g</span>
    </div>
  )
}
