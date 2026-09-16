export default function Header({ mealCount = 0 }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-dot" />
        FoodLens
      </div>
      <span className="session">
        {mealCount} repas cette session
      </span>
    </header>
  )
}
