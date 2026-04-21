import type { Canton } from '@/types/canton'
import type { LangSuffix } from '@/i18n'

export const CANTONS: Canton[] = [
  { code: 'AG', labelFR: 'Argovie',                          labelDE: 'Aargau' },
  { code: 'AI', labelFR: 'Appenzell Rhodes-Intérieures',     labelDE: 'Appenzell Innerrhoden' },
  { code: 'AR', labelFR: 'Appenzell Rhodes-Extérieures',     labelDE: 'Appenzell Ausserrhoden' },
  { code: 'BE', labelFR: 'Berne',                            labelDE: 'Bern' },
  { code: 'BL', labelFR: 'Bâle-Campagne',                   labelDE: 'Basel-Landschaft' },
  { code: 'BS', labelFR: 'Bâle-Ville',                      labelDE: 'Basel-Stadt' },
  { code: 'FR', labelFR: 'Fribourg',                         labelDE: 'Freiburg' },
  { code: 'GE', labelFR: 'Genève',                           labelDE: 'Genf' },
  { code: 'GL', labelFR: 'Glaris',                           labelDE: 'Glarus' },
  { code: 'GR', labelFR: 'Grisons',                          labelDE: 'Graubünden' },
  { code: 'JU', labelFR: 'Jura',                             labelDE: 'Jura' },
  { code: 'LU', labelFR: 'Lucerne',                          labelDE: 'Luzern' },
  { code: 'NE', labelFR: 'Neuchâtel',                        labelDE: 'Neuenburg' },
  { code: 'NW', labelFR: 'Nidwald',                          labelDE: 'Nidwalden' },
  { code: 'OW', labelFR: 'Obwald',                           labelDE: 'Obwalden' },
  { code: 'SG', labelFR: 'Saint-Gall',                       labelDE: 'St. Gallen' },
  { code: 'SH', labelFR: 'Schaffhouse',                      labelDE: 'Schaffhausen' },
  { code: 'SO', labelFR: 'Soleure',                          labelDE: 'Solothurn' },
  { code: 'SZ', labelFR: 'Schwytz',                          labelDE: 'Schwyz' },
  { code: 'TG', labelFR: 'Thurgovie',                        labelDE: 'Thurgau' },
  { code: 'TI', labelFR: 'Tessin',                           labelDE: 'Tessin' },
  { code: 'UR', labelFR: 'Uri',                              labelDE: 'Uri' },
  { code: 'VD', labelFR: 'Vaud',                             labelDE: 'Waadt' },
  { code: 'VS', labelFR: 'Valais',                           labelDE: 'Wallis' },
  { code: 'ZG', labelFR: 'Zoug',                             labelDE: 'Zug' },
  { code: 'ZH', labelFR: 'Zurich',                           labelDE: 'Zürich' },
]

export const getCantonLabel = (code: string, langSuffix: LangSuffix): string => {
  const canton = CANTONS.find((c) => c.code === code)
  if (!canton) return code
  return langSuffix === 'DE' ? canton.labelDE : canton.labelFR
}
