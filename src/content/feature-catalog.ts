import rawCatalog from './feature-catalog.json'

export type FeatureRoleId = 'owner' | 'barber' | 'client'

export interface FeatureRole {
  id: FeatureRoleId
  label: string
  summary: string
  keyBenefits: string[]
  landingFeatureIds: string[]
}

export interface FeatureItem {
  id: string
  title: string
  description: string
  roles: FeatureRoleId[]
  benefit: string
  advantage: string
  modules: string[]
  roleBenefits: Partial<Record<FeatureRoleId, string>>
}

export interface FeatureCatalog {
  version: string
  lastUpdated: string
  roles: FeatureRole[]
  features: FeatureItem[]
}

export const featureCatalog = rawCatalog as FeatureCatalog

export const featureById = new Map(featureCatalog.features.map((feature) => [feature.id, feature]))

export function getLandingFeaturesForRole(roleId: FeatureRoleId): FeatureItem[] {
  const role = featureCatalog.roles.find((item) => item.id === roleId)
  if (!role) {
    return []
  }

  return role.landingFeatureIds
    .map((featureId) => featureById.get(featureId))
    .filter((feature): feature is FeatureItem => Boolean(feature))
}
