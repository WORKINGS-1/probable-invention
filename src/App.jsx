import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore'
import Login from './Login'

export default function App() {
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) await loadHistory(u.uid)
    })
    return () => unsub()
  }, [])

  async function loadHistory(uid) {
    const ref = collection(db, "users", uid, "maasserHistory")
    const snap = await getDocs(ref)
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    setHistory(data.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)))
  }

  async function addTestLine() {
    if (!user) return
    const ref = collection(db, "users", user.uid, "maasserHistory")
    await addDoc(ref, {
      date: Timestamp.now(),
      amount: 123.45,
      details: [{ name: "Salaire", type: "income", amount: 1000 }]
    })
    await loadHistory(user.uid)
    showMessage("✅ Ligne ajoutée à l'historique")
  }

  function showMessage(msg) {
    setMessage(msg)
    setTimeout(() => setMessage(""), 3000)
  }

  if (!user) return <Login onUser={setUser} />

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto", fontFamily: "sans-serif" }}>
      {message && (
        <div style={{
          backgroundColor: "#e6ffe6",
          border: "1px solid #4caf50",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          textAlign: "center",
          color: "#2e7d32",
          fontWeight: "bold"
        }}>
          {message}
        </div>
      )}

      <h1>Bienvenue, {user.email}</h1>
      <button onClick={() => signOut(auth)}>Se déconnecter</button>

      <hr />
      <h2>Test message + ajout historique</h2>
      <button onClick={addTestLine}>📋 Ajouter ligne test</button>

      <hr />
      <h2>🕓 Historique (lecture seule)</h2>
      <ul>
        {history.length === 0 && <li>Aucune ligne encore.</li>}
        {history.map((entry, i) => (
          <li key={entry.id || i}>
            {entry.date?.seconds
              ? new Date(entry.date.seconds * 1000).toLocaleDateString()
              : "⏳"} — {entry.amount} €
          </li>
        ))}
      </ul>
    </div>
  )
}
