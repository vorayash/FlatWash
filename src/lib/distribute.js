/**
 * Greedy least-debt-first distribution.
 * Assigns utensils to members so cumulative effort stays as equal as possible.
 */
export function distribute(utensils, members, sessions) {
  // Build cumulative effort from history
  const cumulative = {}
  members.forEach(m => { cumulative[m.uid] = 0 })

  sessions.forEach(session => {
    session.assignments?.forEach(a => {
      if (cumulative[a.uid] !== undefined) {
        cumulative[a.uid] += a.sessionEffort || 0
      }
    })
  })

  // Sort heaviest utensil first
  const sorted = [...utensils].sort((a, b) => b.effort - a.effort)

  // Session totals start at 0
  const sessionTotals = {}
  members.forEach(m => { sessionTotals[m.uid] = 0 })

  const buckets = {}
  members.forEach(m => { buckets[m.uid] = [] })

  sorted.forEach(utensil => {
    // Pick member with lowest combined (historical + this session) effort
    const target = members.slice().sort((a, b) => {
      const aTotal = (cumulative[a.uid] || 0) + (sessionTotals[a.uid] || 0)
      const bTotal = (cumulative[b.uid] || 0) + (sessionTotals[b.uid] || 0)
      if (aTotal !== bTotal) return aTotal - bTotal
      return a.uid.localeCompare(b.uid) // deterministic tie-break
    })[0]

    buckets[target.uid].push(utensil)
    sessionTotals[target.uid] += utensil.effort
  })

  return members.map(m => ({
    uid: m.uid,
    name: m.name,
    photoURL: m.photoURL,
    utensils: buckets[m.uid],
    sessionEffort: sessionTotals[m.uid],
  }))
}
