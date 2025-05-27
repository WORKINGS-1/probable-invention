import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth'
import {
  doc, getDoc, setDoc
} from 'firebase/firestore'
import Login from './Login'

export default function App() {
  const [user, setUser] = useState(null)
  const [fields, setFields] = useState([])
  const [rate, setRate] = useState(10)

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      if (u) loadUserData(u.uid)
    })
    return () => unsub()
  }, [])

  // Charger les données depuis Firestore
  async function loadUserData(uid) {
    const ref = doc(db, "users", uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data()
      setFields(data.fields || [])
      setRate(data.rate || 10)
    }
  }

  // Enregistrer dans Firestore
  async function saveUserData() {
    if (!user) return
    const ref = doc(db, "users", user.uid)
    await setDoc(ref, { fields, rate })
  }

  // Ajouter un champ
  const addField = () => {
    setFields([...fields, { name: "", type: "income", amount: 0 }])
  }

  // Modifier un champ
  const updateField = (index, key, value) => {
    const newFields = [...fields]
    newFields[index][key] = key === "amount" ? parseFloat(value) || 0 : value
    setFields(newFields)
  }

  // Supprimer un champ
  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index)
    setFields(newFields)
  }

  // Calcul Maasser
  const calculateMaasser = () => {
    const income = fields.filter(f => f.type === "income").reduce((sum, f) => sum + f.amount, 0)
    const deductions = fields.filter(f => f.type === "deduction").reduce((sum, f) => sum + f.amount, 0)
    const base = income - deductions
    return (base * rate / 100).toFixed(2)
  }

  if (!user) return <Login onUser={setUser} />

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 600, margin: "auto" }}>
      <h1>Bienvenue, {user.email}</h1>
      <button onClick={() => signOut(auth)}>Se déconnecter</button>
      <hr />

      <h2>Vos champs personnalisés</h2>
      {fields.map((field, i) => (
        <div key={i} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
          <input
            type="text"
            placeholder="Nom"
            value={field.name}
            onChange={e => updateField(i, "name", e.target.value)}
            style={{ marginRight: "1rem" }}
          />
          <select
            value={field.type}
            onChange={e => updateField(i, "type", e.target.value)}
            style={{ marginRight: "1rem" }}
          >
            <option value="income">Revenu</option>
            <option value="deduction">Dépense déductible</option>
          </select>
          <input
            type="number"
            placeholder="Montant"
            value={field.amount}
            onChange={e => updateField(i, "amount", e.target.value)}
            style={{ width: "100px" }}
          />
          <button onClick={() => removeField(i)} style={{ marginLeft: "1rem" }}>🗑</button>
        </div>
      ))}

      <button onClick={addField}>➕ Ajouter un champ</button>

      <br /><br />
      <label>Pourcentage de Maasser :
        <select value={rate} onChange={e => setRate(Number(e.target.value))}>
          <option value={10}>10%</option>
          <option value={20}>20%</option>
        </select>
      </label>

      <br /><br />
      <button onClick={saveUserData}>💾 Enregistrer mes données</button>

      <h3>📊 Maasser à donner : {calculateMaasser()} €</h3>
    </div>
  )
}
