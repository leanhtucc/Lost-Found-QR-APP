import { isValidCoordinate } from '../location';

describe('Location Validator (isValidCoordinate)', () => {
  it('accepts valid coordinates across Vietnam and the globe', () => {
    expect(isValidCoordinate({ latitude: 10.7769, longitude: 106.7009 })).toBe(true);
    expect(isValidCoordinate({ latitude: 21.0285, longitude: 105.8542 })).toBe(true);
    expect(isValidCoordinate({ latitude: -33.8688, longitude: 151.2093 })).toBe(true);
  });

  it('accepts (0, 0) as valid coordinates (Equator / Prime Meridian)', () => {
    expect(isValidCoordinate({ latitude: 0, longitude: 0 })).toBe(true);
    expect(isValidCoordinate({ latitude: 0, longitude: 105.8 })).toBe(true);
    expect(isValidCoordinate({ latitude: 21.0, longitude: 0 })).toBe(true);
  });

  it('accepts boundary coordinates [-90, 90] and [-180, 180]', () => {
    expect(isValidCoordinate({ latitude: 90, longitude: 180 })).toBe(true);
    expect(isValidCoordinate({ latitude: -90, longitude: -180 })).toBe(true);
    expect(isValidCoordinate({ latitude: 90, longitude: -180 })).toBe(true);
    expect(isValidCoordinate({ latitude: -90, longitude: 180 })).toBe(true);
  });

  it('rejects out of bounds latitude', () => {
    expect(isValidCoordinate({ latitude: 90.0001, longitude: 100 })).toBe(false);
    expect(isValidCoordinate({ latitude: -90.0001, longitude: 100 })).toBe(false);
    expect(isValidCoordinate({ latitude: 120, longitude: 100 })).toBe(false);
  });

  it('rejects out of bounds longitude', () => {
    expect(isValidCoordinate({ latitude: 10, longitude: 180.0001 })).toBe(false);
    expect(isValidCoordinate({ latitude: 10, longitude: -180.0001 })).toBe(false);
    expect(isValidCoordinate({ latitude: 10, longitude: 200 })).toBe(false);
  });

  it('rejects non-finite, NaN, null, and non-numeric inputs', () => {
    expect(isValidCoordinate(null)).toBe(false);
    expect(isValidCoordinate(undefined)).toBe(false);
    expect(isValidCoordinate({})).toBe(false);
    expect(isValidCoordinate({ latitude: NaN, longitude: 100 })).toBe(false);
    expect(isValidCoordinate({ latitude: 10, longitude: Infinity })).toBe(false);
    expect(isValidCoordinate({ latitude: -Infinity, longitude: 10 })).toBe(false);
    expect(isValidCoordinate({ latitude: '10.5', longitude: '106.5' })).toBe(false);
  });
});
