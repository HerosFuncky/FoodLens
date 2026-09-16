import { useRef, useState } from "react"

export default function UploadZone({ onAnalyze, loading, preview }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      onAnalyze(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""} ${loading ? "loading" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {loading ? (
        <div className="upload-loading">
          {preview && <img className="upload-preview" src={preview} alt="" />}
          <div className="scan-line" />
          <p className="upload-text">Analyse…</p>
        </div>
      ) : (
        <div className="upload-content">
          <span className="upload-icon">+</span>
          <p className="upload-text">Glisse une photo<br />ou clique</p>
          <p className="upload-hint">JPG · PNG · WEBP</p>
        </div>
      )}
    </div>
  )
}
