import {
  calculateViewportQuery,
  getHaversineDistanceMeters,
  isSignificantViewportChange,
  MIN_RADAR_RADIUS_METERS,
  MAX_RADAR_RADIUS_METERS,
  Region,
} from '../geoViewport';

describe('geoViewport utility', () => {
  describe('calculateViewportQuery', () => {
    it('calculates expected half-diagonal radius for a normal viewport in Vietnam (Ho Chi Minh City, lat ~10.77)', () => {
      const region: Region = {
        latitude: 10.7769,
        longitude: 106.7009,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      const result = calculateViewportQuery(region, 1.0); // unpadded for exact math

      // latMeters = 0.02 * 111320 = 2226.4
      // lngMeters = 0.02 * 111320 * cos(10.7769 deg) = 2226.4 * 0.98237 = 2187.15
      // halfDiagonal = sqrt(2226.4^2 + 2187.15^2) / 2 = sqrt(4956856.96 + 4783625.12) / 2 = 3120.9 / 2 = ~1560m
      expect(result.radius).toBeGreaterThan(1500);
      expect(result.radius).toBeLessThan(1650);
      expect(result.isCapped).toBe(false);
      expect(result.lat).toBeCloseTo(10.7769, 4);
      expect(result.lng).toBeCloseTo(106.7009, 4);
    });

    it('scales longitude distance accurately across different latitudes using cosine scaling', () => {
      // Near Equator (lat = 0): cos(0) = 1.0 -> lngMeters == latMeters
      const equatorRegion: Region = {
        latitude: 0,
        longitude: 100,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      const equatorResult = calculateViewportQuery(equatorRegion, 1.0);

      // High latitude (lat = 60 deg): cos(60 deg) = 0.5 -> lngMeters == 0.5 * latMeters
      const highLatRegion: Region = {
        latitude: 60,
        longitude: 100,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      const highLatResult = calculateViewportQuery(highLatRegion, 1.0);

      // High latitude radius should be strictly smaller than equator radius due to longitude convergence
      expect(highLatResult.radius).toBeLessThan(equatorResult.radius);
    });

    it('clamps radius to MAX_RADAR_RADIUS_METERS (10,000m) and marks isCapped=true for zoomed-out viewports', () => {
      // Entire country view: delta = 5.0 (hundreds of km)
      const zoomedOutRegion: Region = {
        latitude: 16.0,
        longitude: 108.0,
        latitudeDelta: 5.0,
        longitudeDelta: 5.0,
      };

      const result = calculateViewportQuery(zoomedOutRegion);

      expect(result.radius).toBe(MAX_RADAR_RADIUS_METERS);
      expect(result.isCapped).toBe(true);
    });

    it('clamps radius to MIN_RADAR_RADIUS_METERS (500m) for tightly zoomed-in viewports', () => {
      // Block/building level view: delta = 0.001 (~100m)
      const zoomedInRegion: Region = {
        latitude: 10.7769,
        longitude: 106.7009,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };

      const result = calculateViewportQuery(zoomedInRegion);

      expect(result.radius).toBe(MIN_RADAR_RADIUS_METERS);
      expect(result.isCapped).toBe(false);
    });
  });

  describe('getHaversineDistanceMeters', () => {
    it('calculates accurate distance between coordinates', () => {
      // Distance between Notre Dame Cathedral HCMC (10.7798, 106.6990) and Ben Thanh Market (10.7725, 106.6980)
      const dist = getHaversineDistanceMeters(10.7798, 106.699, 10.7725, 106.698);
      // Actual distance is ~818 meters
      expect(dist).toBeGreaterThan(800);
      expect(dist).toBeLessThan(850);
    });

    it('returns 0 for identical coordinates', () => {
      expect(getHaversineDistanceMeters(10.5, 106.5, 10.5, 106.5)).toBe(0);
    });
  });

  describe('isSignificantViewportChange', () => {
    const baseRegion: Region = {
      latitude: 10.7769,
      longitude: 106.7009,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    it('returns true when prevRegion is null (initial load)', () => {
      expect(isSignificantViewportChange(null, baseRegion)).toBe(true);
    });

    it('returns false for tiny micro-pans (< 150m)', () => {
      // 0.0005 deg is ~55 meters
      const tinyMove: Region = {
        ...baseRegion,
        latitude: baseRegion.latitude + 0.0005,
      };
      expect(isSignificantViewportChange(baseRegion, tinyMove)).toBe(false);
    });

    it('returns true for significant pans (>= 150m)', () => {
      // 0.003 deg is ~330 meters
      const bigMove: Region = {
        ...baseRegion,
        latitude: baseRegion.latitude + 0.003,
      };
      expect(isSignificantViewportChange(baseRegion, bigMove)).toBe(true);
    });

    it('returns true for significant zoom changes (>= 15% change in delta)', () => {
      const zoomedIn: Region = {
        ...baseRegion,
        latitudeDelta: baseRegion.latitudeDelta * 0.7, // 30% zoom in
        longitudeDelta: baseRegion.longitudeDelta * 0.7,
      };
      expect(isSignificantViewportChange(baseRegion, zoomedIn)).toBe(true);
    });
  });
});
