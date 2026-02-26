import { useState } from 'react'

const statusLabels = {
  new: 'Новый',
  draft_ready: 'Черновик готов',
  in_progress: 'В работе',
  sent: 'Отправлен',
  closed: 'Закрыт',
}

export default function TicketTable({ tickets, onUpdate, apiBase }) {
  const [adding, setAdding] = useState(false)
  const [subject, setSubject] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!subject.trim() || !clientEmail.trim()) return
    fetch(`${apiBase}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: subject.trim(),
        client_email: clientEmail.trim(),
        initial_message: message.trim() || null,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(() => {
        setSubject('')
        setClientEmail('')
        setMessage('')
        setAdding(false)
        onUpdate()
      })
      .catch(() => {})
  }

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <button type="button" onClick={() => setAdding(!adding)}>
          {adding ? 'Отмена' : '+ Добавить тикет'}
        </button>
        {adding && (
          <form onSubmit={handleAdd} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 400 }}>
            <input
              placeholder="Тема"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <input
              placeholder="Email клиента"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <textarea
              placeholder="Текст обращения (необязательно)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <button type="submit">Создать</button>
          </form>
        )}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>ID</th>
            <th style={{ padding: '0.5rem' }}>Тема</th>
            <th style={{ padding: '0.5rem' }}>Клиент</th>
            <th style={{ padding: '0.5rem' }}>Статус</th>
            <th style={{ padding: '0.5rem' }}>Создан</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '0.5rem' }}>{t.id}</td>
              <td style={{ padding: '0.5rem' }}>{t.subject}</td>
              <td style={{ padding: '0.5rem' }}>{t.client_email}</td>
              <td style={{ padding: '0.5rem' }}>{statusLabels[t.status] ?? t.status}</td>
              <td style={{ padding: '0.5rem' }}>{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {tickets.length === 0 && !adding && <p>Нет тикетов. Добавьте первый.</p>}
    </>
  )
}
