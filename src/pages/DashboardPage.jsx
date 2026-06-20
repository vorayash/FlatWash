import { useState } from 'react'
import Layout from '../components/Layout'
import NewSessionTab from './NewSessionTab'
import HistoryTab from './HistoryTab'
import BalanceTab from './BalanceTab'
import SettingsTab from './SettingsTab'
import { useFlat } from '../hooks/useFlat'
import { useSessions } from '../hooks/useSessions'

export default function DashboardPage({ flatId, onLeft }) {
  const [activeTab, setActiveTab] = useState('session')
  const { flat, loading: flatLoading } = useFlat(flatId, onLeft)
  const { sessions, loading: sessionsLoading } = useSessions(flatId)

  if (flatLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <Layout flat={flat} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'session' && <NewSessionTab flat={flat} sessions={sessions} />}
      {activeTab === 'history' && <HistoryTab flat={flat} sessions={sessions} />}
      {activeTab === 'balance' && <BalanceTab flat={flat} sessions={sessions} />}
      {activeTab === 'settings' && <SettingsTab flat={flat} onLeft={onLeft} />}
    </Layout>
  )
}
