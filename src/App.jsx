import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  collection,
  getDocs,
  addDoc,
  Timestamp
} from 'firebase/firestore'
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
    if (!user) {
      showMessage("❌ Non connecté")
      return
    }

    // ✅ Afficher immédiatement
    showMessage("⏳ Envoi en cours...")

    try {
      const ref = collection(db, "users", user.uid, "maasserHistory")
      await addDoc(ref, {
        date: Timestamp.now(),
        amount: 123.45,
        details: [{ name: "Salaire", type: "income", amount: 1000 }]
      })

      showMessage("✅ Ligne ajoutée")
      await loadHistory(user.uid)
    } catch (err) {
      showMessage("❌ Erreur : " + err.message)
    }
  }

  function showMessage(msg) {
    setMessage(msg)
    // ✨ Ne pas l’effacer tout de suite
    setTimeout(() => setMessage(""), 3000)
  }

  if (!user) return <Login onUser={setUser} />

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 600, margin: "auto" }}>
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
      <h2>Test : ajouter ligne d’historique</h2>
      <button onClick={addTestLine}>📋 Ajouter une ligne test</button>

      <hr />
      <h2>🕓 Historique</h2>
      <ul>
        {history.length === 0 && <li>Aucun historique pour l’instant.</li>}
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
