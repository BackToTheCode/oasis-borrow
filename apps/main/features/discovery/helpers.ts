import { DiscoveryFiltersList } from 'apps/main/features/discovery/meta'

export function getDefaultSettingsState({ filters }: { filters: DiscoveryFiltersList }) {
  return Object.keys(filters).reduce((o, key) => ({ ...o, [key]: filters[key][0].value }), {})
}
