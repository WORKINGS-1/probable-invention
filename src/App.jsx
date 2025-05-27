import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, collection,
  addDoc, getDocs, updateDoc, serverTimestamp, Timestamp
} from 'firebase/firestore'
import Login from './Login'

export default function App() {
  const [user, setUser] = useState(null)
  const [fields, setFields] = useState([])
  const [rate, setRate] = useState(10)
  const [history, setHistory] = useState([])
  const [successMsg, setSuccessMsg] = useState("")
  const [customDate, setCustomDate] = useState("")
  const [editMode, setEditMode] = useState({}) // { entryId: true/false }
  const [editData, setEditData] = useState({}) // { entryId: { date, amount } }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      if (u) {
        loadUserData(u.uid)
        loadHistory(u.uid)
      }
    })
    return () => unsub()
  }, [])

  async function loadUserData(uid) {
    const ref = doc(db, "users", uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data()
      setFields(data.fields || [])
      setRate(data.rate || 10)
    }
  }

  async function loadHistory(uid) {
    const ref = collection(db, "users", uid, "maasserHistory")
    const snap = await getDocs(ref)
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    setHistory(data.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0)))
  }

  async function saveUserData() {
    if (!user) return
    const ref = doc(db, "users", user.uid)
    await setDoc(ref, { fields, rate })

    const calcAmount = calculateMaasser()
    const historyRef = collection(db, "users", user.uid, "maasserHistory")
    await addDoc(historyRef, {
      date: serverTimestamp(),
      amount: calcAmount,
      details: fields
    })

    setSuccessMsg("✅ Données et historique enregistrés")
    setTimeout(() => setSuccessMsg(""), 3000)
    loadHistory(user.uid)
  }

  async function markAsPaid() {
    if (!user || !customDate) {
      setSuccessMsg("❌ Veuillez choisir une date")
      setTimeout(() => setSuccessMsg(""), 3000)
      return
    }

    const historyRef = collection(db, "users", user.uid, "maasserHistory")
    await addDoc(historyRef, {
      date: Timestamp.fromDate(new Date(customDate)),
      amount: calculateMaasser(),
      details: fields
    })

    setSuccessMsg("✅ Paiement enregistré avec succès !")
    setCustomDate("")
    setTimeout(() => setSuccessMsg(""), 3000)
    loadHistory(user.uid)
  }

  const handleEdit = (entry) => {
    setEditMode({ ...editMode, [entry.id]: true })
    setEditData({
      ...editData,
      [entry.id]: {
        amount: entry.amount,
        date: entry.date?.seconds
          ? new Date(entry.date.seconds * 1000).toISOString().substring(0, 10)
          : ""
      }
    })
  }

  const handleEditChange = (entryId, key, value) => {
    setEditData({
      ...editData,
      [entryId]: {
        ...editData[entryId],
        [key]: value
      }
    })
  }

  const validateEdit = async (entryId) => {
    const ref = doc(db, "users", user.uid, "maasserHistory", entryId)
    const { amount, date } = editData[entryId]
    await updateDoc(ref, {
      amount: parseFloat(amount),
      date: Timestamp.fromDate(new Date(date))
    })
    setSuccessMsg("✅ Modifications enregistrées")
    setEditMode({ ...editMode, [entryId]: false })
    setTimeout(() => setSuccessMsg(""), 3000)
    loadHistory(user.uid)
  }

  const addField = () => {
    setFields([...fields, { name: "", type: "income", amount: 0 }])
  }

  const updateField = (index, key, value) => {
    const newFields = [...fields]
    newFields[index][key] = key === "amount" ? parseFloat(value) || 0 : value
    setFields(newFields)
  }

  const removeField = (index) => {
    const newFields = fields.filter((_, i) => i !== index)
    setFields(newFields)
  }

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
            <option value="deduction">Dépense</option>
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

      <hr />
      <h2>✅ J’ai payé mon Maasser ce mois</h2>
      <input
        type="date"
        value={customDate}
        onChange={e => setCustomDate(e.target.value)}
      />
      <button onClick={markAsPaid} style={{ marginLeft: "1rem" }}>📅 Valider ce paiement</button>

      {successMsg && <p style={{ color: "green", fontWeight: "bold" }}>{successMsg}</p>}

      <hr />
      <h2>🕓 Historique des calculs</h2>
      <ul>
        {history.length === 0 && <li>Aucun historique pour l’instant.</li>}
        {history.map((entry, i) => (
          <li key={entry.id || i} style={{ marginBottom: "1rem" }}>
            {editMode[entry.id] ? (
              <div>
                📅 <input
                  type="date"
                  value={editData[entry.id]?.date}
                  onChange={e => handleEditChange(entry.id, "date", e.target.value)}
                /> — 💶
                <input
                  type="number"
                  value={editData[entry.id]?.amount}
                  onChange={e => handleEditChange(entry.id, "amount", e.target.value)}
                  style={{ width: "100px", marginLeft: "1rem" }}
                />
                <button onClick={() => validateEdit(entry.id)} style={{ marginLeft: "1rem" }}>
                  💾 Valider les modifs
                </button>
              </div>
            ) : (
              <div>
                📅 {entry.date?.seconds
                  ? new Date(entry.date.seconds * 1000).toLocaleDateString()
                  : "⏳"} — 💶 {entry.amount} €
                <button onClick={() => handleEdit(entry)} style={{ marginLeft: "1rem" }}>
                  ✏️ Modifier
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
