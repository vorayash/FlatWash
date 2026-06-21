/**
 * Greedy least-debt-first distribution.
 * Assigns utensils to members so cumulative effort stays as equal as possible.
 * seed shifts member tie-break order so re-distributing produces different results.
 */
export function distribute(utensils, members, sessions, seed = 0) {
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

  // Rotate member order by seed so ties resolve differently each re-distribute
  const rotated = [...members]
  const offset = seed % members.length
  rotated.push(...rotated.splice(0, offset))

  // Sort heaviest utensil first
  const sorted = [...utensils].sort((a, b) => b.effort - a.effort)

  // Session totals start at 0
  const sessionTotals = {}
  rotated.forEach(m => { sessionTotals[m.uid] = 0 })

  const buckets = {}
  rotated.forEach(m => { buckets[m.uid] = [] })

  sorted.forEach(utensil => {
    // Pick member with lowest combined (historical + this session) effort
    const target = rotated.slice().sort((a, b) => {
      const aTotal = (cumulative[a.uid] || 0) + (sessionTotals[a.uid] || 0)
      const bTotal = (cumulative[b.uid] || 0) + (sessionTotals[b.uid] || 0)
      if (aTotal !== bTotal) return aTotal - bTotal
      // tie-break uses rotated position instead of uid so seed changes the result
      return rotated.indexOf(a) - rotated.indexOf(b)
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
