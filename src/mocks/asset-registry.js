/**
 * Enhanced mock implementation for missing-asset-registry-path
 */

const registeredAssets = new Map();

module.exports = {
  registerAsset: (asset) => {
    const id = Math.floor(Math.random() * 10000) + 1;
    registeredAssets.set(id, {
      ...asset,
      __packager_asset: true,
      scales: asset.scales || [1],
      hash: asset.hash || '',
      name: asset.name || '',
      type: asset.type || '',
      height: asset.height || 0,
      width: asset.width || 0,
    });
    return id;
  },
  getAssetByID: (assetId) => {
    const asset = registeredAssets.get(assetId);
    if (!asset) {
      console.warn(`[Asset Registry Mock] Asset not found for ID: ${assetId}`);
      return null;
    }
    return asset;
  },
  // Add support for direct path resolution
  resolveAssetSource: (source) => {
    if (typeof source === 'number') {
      return registeredAssets.get(source) || null;
    }
    if (source && source.uri) {
      return source;
    }
    return null;
  }
}; 