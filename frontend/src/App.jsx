import { useState } from "react"
import Header from "./components/Header"
import UploadZone from "./components/UploadZone"
import AllergenSelector from "./components/AllergenSelector"
import ResultCard from "./components/ResultCard"
import MealHistory from "./components/MealHistory"
import "./App.css"

const DAILY_TARGET = 1750

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [allergens, setAllergens] = useState([])
  const [meals, setMeals] = useState([])

  const handleAnalyze = async (file) => {
    setLoading(true)
    setError(null)
    setResult(null)
    const url = URL.createObjectURL(file)
    setPreview(url)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("allergens", JSON.stringify(allergens))

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) throw new Error("Erreur serveur")
      const data = await response.json()
      setResult(data)
      setMeals((prev) => [{ result: data, preview: url }, ...prev].slice(0, 6))
    } catch (err) {
      setError("Impossible d'analyser l'image. Vérifie que le backend tourne.")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setPreview(null)
    setError(null)
  }

  const showMeal = (m) => {
    setResult(m.result)
    setPreview(m.preview)
    setError(null)
  }

  const consumed = meals.reduce(
    (sum, m) => sum + (m.result?.nutrition?.calories || 0),
    0
  )
  const remaining = Math.round(DAILY_TARGET - consumed)

  return (
    <div className="app">
      <Header mealCount={meals.length} />

      <main className="main">
        {!result && (
          <section className="intro">
            <div className="intro-hero">
              <p className="eyebrow">FoodLens</p>
              <h2 className="intro-title">Qu'y a-t-il dans ton assiette ?</h2>
            </div>
            <AllergenSelector selected={allergens} onChange={setAllergens} />
            <UploadZone onAnalyze={handleAnalyze} loading={loading} preview={preview} />
            {error && <div className="error">{error}</div>}
          </section>
        )}

        {result && (
          <ResultCard
            result={result}
            preview={preview}
            remaining={remaining}
            onReset={reset}
          />
        )}

        <MealHistory meals={meals} onSelect={showMeal} />
      </main>
    </div>
  )
}

export default App
