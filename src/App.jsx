import { useState, useEffect } from 'react'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import Login from './Login'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setUser(user))
    return () => unsub()
  }, [])

  if (!user) return <Login onUser={setUser} />

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Bienvenue, {user.email}</h1>
      <button onClick={() => signOut(auth)}>Se déconnecter</button>
      <hr />

      {/* Ici on mettra les champs personnalisés plus tard */}
      <p>Ici viendront vos champs de calcul de Maasser personnalisés</p>
    </div>
  )
}

export default App
