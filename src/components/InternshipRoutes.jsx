import { memo, useMemo } from 'react'
import { Line } from '@react-three/drei'
import { useTechData } from '../hooks/useTechData.js'
import { buildArcCurve, findPositionById } from '../utils/math.js'
import { PALETTE } from '../utils/colors.js'
import FlowParticles from './FlowParticles.jsx'

/**
 * InternshipRoutes renders the named, data-backed pipelines from the
 * MDC WORKS placement report: internship routes (thin cyan arcs) and
 * full-time hire conversions (thicker green arcs). Unlike TalentFlow's
 * ambient corridors, every line here corresponds to a real tracked route
 * with a `role`/`title`, so it's the layer analysts would use to answer
 * "who got placed where."
 */
function InternshipRoutes() {
  const universities = useTechData((s) => s.universities)
  const startups = useTechData((s) => s.startups)
  const employers = useTechData((s) => s.employers)
  const internshipRoutes = useTechData((s) => s.internshipRoutes)
  const fullTimeHires = useTechData((s) => s.fullTimeHires)
  const internshipPlacements = useTechData((s) => s.internshipPlacements)
  const visible = useTechData((s) => s.layerFilters.Internships)

  const collections = [universities, startups, employers]

  const internshipCurves = useMemo(
    () =>
      internshipRoutes
        .map((route) => {
          const from = findPositionById(route.from, collections)
          const to = findPositionById(route.to, collections)
          if (!from || !to) return null
          return { ...route, curve: buildArcCurve(from, to, 1.2) }
        })
        .filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [internshipRoutes, universities, startups, employers]
  )

  const hireCurves = useMemo(
    () =>
      fullTimeHires
        .map((hire) => {
          const from = findPositionById(hire.from, collections)
          const to = findPositionById(hire.to, collections)
          if (!from || !to) return null
          return { ...hire, curve: buildArcCurve(from, to, 2.0) }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
        .filter(Boolean),
    [fullTimeHires, universities, startups, employers]
  )

  if (!visible) return null

  // Placement intensity (0-1) drives how many routes are actively "lit up"
  // with traveling particles vs. shown as dim static lines.
  const activeFraction = internshipPlacements / 100

  return (
    <group>
      {internshipCurves.map((route, i) => {
        const points = route.curve.getPoints(24)
        const isActive = i / internshipCurves.length < activeFraction
        return (
          <group key={route.id}>
            <Line
              points={points}
              color={PALETTE.cyan}
              lineWidth={isActive ? 1.5 : 0.75}
              transparent
              opacity={isActive ? 0.55 : 0.15}
            />
            {isActive && (
              <FlowParticles curve={route.curve} count={route.count} color={PALETTE.cyan} speed={0.18} size={0.05} />
            )}
          </group>
        )
      })}

      {hireCurves.map((hire, i) => {
        const points = hire.curve.getPoints(24)
        const isActive = i / hireCurves.length < activeFraction
        return (
          <group key={hire.id}>
            <Line
              points={points}
              color={PALETTE.green}
              lineWidth={isActive ? 2.2 : 1}
              transparent
              opacity={isActive ? 0.75 : 0.2}
            />
            {isActive && (
              <FlowParticles curve={hire.curve} count={2} color={PALETTE.green} speed={0.12} size={0.07} />
            )}
          </group>
        )
      })}
    </group>
  )
}

export default memo(InternshipRoutes)
