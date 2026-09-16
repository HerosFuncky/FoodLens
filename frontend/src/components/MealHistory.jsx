export default function MealHistory({ meals, onSelect }) {
  if (!meals.length) return null
  return (
    <div className="history">
      <p className="history-title">Cette session</p>
      <div className="history-strip">
        {meals.map((m, i) => (
          <button
            key={i}
            className="history-item"
            onClick={() => onSelect(m)}
            title={m.result.identified_food || m.result.food}
          >
            {m.preview && <img src={m.preview} alt="" />}
          </button>
        ))}
      </div>
    </div>
  )
}
