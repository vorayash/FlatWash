import { useState } from 'react'
import Layout from '../components/Layout'
import NewSessionTab from './NewSessionTab'
import HistoryTab from './HistoryTab'
import BalanceTab from './BalanceTab'
import SettingsTab from './SettingsTab'
import { useFlat } from '../hooks/useFlat'
import { useSessions } from '../hooks/useSessions'

export default function DashboardPage({ flatId, flatIds, onLeft, onGroupAdded, onGroupSwitch }) {
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
    <Layout flat={flat} activeTab={activeTab} setActiveTab={setActiveTab}
      flatIds={flatIds} onGroupAdded={onGroupAdded} onGroupSwitch={onGroupSwitch}>
      <div style={{ display: activeTab === 'session'  ? '' : 'none' }}><NewSessionTab flat={flat} sessions={sessions} /></div>
      <div style={{ display: activeTab === 'history'  ? '' : 'none' }}><HistoryTab flat={flat} sessions={sessions} /></div>
      <div style={{ display: activeTab === 'balance'  ? '' : 'none' }}><BalanceTab flat={flat} sessions={sessions} /></div>
      <div style={{ display: activeTab === 'settings' ? '' : 'none' }}><SettingsTab flat={flat} onLeft={onLeft} /></div>
    </Layout>
  )
}
