const ALLERGENS = [
  { id: "gluten", label: "Gluten", emoji: "🌾" },
  { id: "lactose", label: "Lactose", emoji: "🥛" },
  { id: "nuts", label: "Noix", emoji: "🥜" },
  { id: "eggs", label: "Oeufs", emoji: "🥚" },
  { id: "fish", label: "Poisson", emoji: "🐟" },
  { id: "shellfish", label: "Crustacés", emoji: "🦐" },
  { id: "soy", label: "Soja", emoji: "🫘" },
  { id: "sesame", label: "Sésame", emoji: "🌰" },
]

export default function AllergenSelector({ selected, onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(a => a !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="allergen-selector">
      <p className="allergen-title">⚠️ Mes allergènes</p>
      <div className="allergen-grid">
        {ALLERGENS.map(a => (
          <button
            key={a.id}
            className={`allergen-btn ${selected.includes(a.id) ? "active" : ""}`}
            onClick={() => toggle(a.id)}
          >
            <span>{a.emoji}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}