import { useState } from 'react'

function App() {
  const [income, setIncome] = useState("")
  const [deduction, setDeduction] = useState("")
  const [rate, setRate] = useState(10)

  const calculate = () => {
    const incomeVal = parseFloat(income) || 0
    const deductionVal = parseFloat(deduction) || 0
    const base = incomeVal - deductionVal
    return (base * rate / 100).toFixed(2)
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Calculateur de Maasser</h1>

      <label>Revenu net : <br />
        <input type="number" value={income} onChange={e => setIncome(e.target.value)} />
      </label>
      <br /><br />

      <label>Dépenses déductibles : <br />
        <input type="number" value={deduction} onChange={e => setDeduction(e.target.value)} />
      </label>
      <br /><br />

      <label>Pourcentage :
        <select value={rate} onChange={e => setRate(Number(e.target.value))}>
          <option value={10}>10% (Maasser)</option>
          <option value={20}>20% (Chomesh)</option>
        </select>
      </label>
      <br /><br />

      <strong>À donner en Tsedaka : {calculate()} €</strong>
    </div>
  )
}

export default App
