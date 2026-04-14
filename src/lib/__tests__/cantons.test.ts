import { CANTONS, getCantonLabel } from '../cantons'

describe('cantons', () => {
  it('contains exactly 26 cantons', () => {
    expect(CANTONS).toHaveLength(26)
  })

  it('each canton has a code and a label', () => {
    CANTONS.forEach((c) => {
      expect(c.code).toBeTruthy()
      expect(c.label).toBeTruthy()
    })
  })

  it('getCantonLabel returns the label for a known code', () => {
    expect(getCantonLabel('GE')).toBe('Genève')
  })

  it('getCantonLabel returns the code if unknown', () => {
    expect(getCantonLabel('XX')).toBe('XX')
  })
})
