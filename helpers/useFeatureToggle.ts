import { mapValues } from 'lodash'
export const FT_LOCAL_STORAGE_KEY = 'features'

type ConfiguredFeatures = Record<Features, boolean>

type Features = 'TestFeature' | 'AnotherTestFeature' | 'AssetLandingPages'
const configuredFeatures: Record<Features, boolean> = {
  TestFeature: false, // used in unit tests
  AnotherTestFeature: true, // used in unit tests
  AssetLandingPages: true,
  // your feature here....
}

export function configureLocalStorageForTests(data: { [feature in Features]?: boolean }) {
  localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(data))
}

// Features in code are added to localstorage on app start, where they do not exist.
// They are also disabled in local storage, even if they are enabled in the code.
// Because a feature is enabled if it's enabled either in code or local storage, the
// feature ends up enabled.

export function loadFeatureToggles(testFeaturesFlaggedEnabled: Array<Features> = []) {
  // update local toggles
  if (typeof localStorage !== 'undefined') {
    // No-yet-loaded features are always set to false in local storage even if true in code.
    const featuresToLoadInLocalStorage = mapValues(configuredFeatures, () => false)

    // Gather features enabled in unit tests.
    const featuresEnabledForUnitTesting = testFeaturesFlaggedEnabled.reduce(
      (acc, feature) => ({
        ...acc,
        [feature]: true,
      }),
      {},
    )

    const featuresSourcedFromCode = {
      ...featuresToLoadInLocalStorage,
      ...featuresEnabledForUnitTesting,
    }

    const featureFlagsInLocalStorage = localStorage.getItem(FT_LOCAL_STORAGE_KEY)
    if (!featureFlagsInLocalStorage) {
      localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(featuresSourcedFromCode))
    } else {
      const userSelectedFeatures: ConfiguredFeatures = JSON.parse(
        featureFlagsInLocalStorage,
      ) as ConfiguredFeatures
      const merged = { ...featuresSourcedFromCode, ...userSelectedFeatures }
      localStorage.setItem(FT_LOCAL_STORAGE_KEY, JSON.stringify(merged))
    }
  }
}

export function useFeatureToggle(feature: Features): boolean {
  const userEnabledFeatures = localStorage.getItem(FT_LOCAL_STORAGE_KEY)
  return JSON.parse(userEnabledFeatures || '{}')[feature] || configuredFeatures[feature]
}