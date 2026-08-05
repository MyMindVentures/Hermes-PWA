import { describe, expect, it } from 'vitest'
import { demoProjects } from '../providers/data-provider'

describe('project dashboard fixtures', () => {
  it('contains project cards with required operational fields', () => {
    expect(demoProjects.length).toBeGreaterThan(0)
    expect(demoProjects.every((project) => project.name && project.status && project.openIssues >= 0 && project.progress >= 0)).toBe(true)
  })
})
