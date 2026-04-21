import { CANTONS, getCantonLabel } from '../cantons'

describe('cantons', () => {
  it('contains exactly 26 cantons', () => {
    expect(CANTONS).toHaveLength(26)
  })

  it('each canton has a code, a French label and a German label', () => {
    CANTONS.forEach((c) => {
      expect(c.code).toBeTruthy()
      expect(c.labelFR).toBeTruthy()
      expect(c.labelDE).toBeTruthy()
    })
  })

  it('getCantonLabel returns the French label', () => {
    expect(getCantonLabel('GE', 'FR')).toBe('Genève')
  })

  it('getCantonLabel returns the German label', () => {
    expect(getCantonLabel('GE', 'DE')).toBe('Genf')
  })

  it('getCantonLabel returns the code if unknown', () => {
    expect(getCantonLabel('XX', 'FR')).toBe('XX')
  })
})
