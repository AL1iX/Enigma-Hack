import { useState, useEffect } from 'react'
import TicketTable from './components/TicketTable'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export default function App() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/tickets`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data) => {
        setTickets(data)
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const refetch = () => {
    setLoading(true)
    fetch(`${API_BASE}/tickets`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data) => setTickets(data))
      .finally(() => setLoading(false))
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Support Agent — Тикеты</h1>
      {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}
      {loading ? <p>Загрузка...</p> : <TicketTable tickets={tickets} onUpdate={refetch} apiBase={API_BASE} />}
    </div>
  )
}
