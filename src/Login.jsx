import { useState } from 'react'
import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'

export default function Login({ onUser }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("login")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      let userCredential
      if (mode === 'register') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      }
      onUser(userCredential.user)
    } catch (err) {
      alert("Erreur : " + err.message)
    }
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{mode === 'login' ? "Connexion" : "Créer un compte"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">
          {mode === 'login' ? "Se connecter" : "S'inscrire"}
        </button>
      </form>
      <br />
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
      </button>
    </div>
  )
}

