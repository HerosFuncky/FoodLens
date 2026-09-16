import { useEffect, useState } from "react"

export default function MacroRing({ carbs = 0, fat = 0, protein = 0 }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [carbs, fat, protein])

  const cK = carbs * 4
  const fK = fat * 9
  const pK = protein * 4
  const total = cK + fK + pK || 1

  const C = 180
  const arcs = [
    { r: 174, color: "var(--safran)", frac: cK / total },
    { r: 158, color: "var(--tomate)", frac: fK / total },
    { r: 142, color: "var(--creme)",  frac: pK / total },
  ]

  return (
    <svg className="macro-ring" viewBox="0 0 360 360" preserveAspectRatio="xMidYMid meet">
      {arcs.map((a, i) => {
        const circ = 2 * Math.PI * a.r
        return (
          <g key={i} transform={`rotate(-90 ${C} ${C})`}>
            <circle cx={C} cy={C} r={a.r} fill="none"
              stroke="rgba(236,227,210,0.08)" strokeWidth="4" />
            <circle cx={C} cy={C} r={a.r} fill="none"
              stroke={a.color} strokeWidth="4" strokeLinecap="round"
              className="macro-arc"
              strokeDasharray={`${shown ? circ * a.frac : 0} ${circ}`} />
          </g>
        )
      })}
    </svg>
  )
}
