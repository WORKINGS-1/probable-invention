import { useState } from 'react'

export default function App() {
  const [successMsg, setSuccessMsg] = useState("")

  const handleClick = () => {
    setSuccessMsg("✅ Action réussie !")
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 500, margin: "auto" }}>
      <h1>Test Affichage de Message</h1>
      <button onClick={handleClick}>Clique ici</button>

      {successMsg && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem",
          backgroundColor: "#e6ffe6",
          border: "1px solid #4caf50",
          borderRadius: "8px",
          color: "#2e7d32",
          fontWeight: "bold",
          textAlign: "center"
        }}>
          {successMsg}
        </div>
      )}
    </div>
  )
}
