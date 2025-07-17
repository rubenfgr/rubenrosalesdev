import { mapCertificationInputDTO, mapCertificationUpdateInputDTO } from './certification.mapper';
import { CertificationInputDTO } from '../models/certification.model';

describe('mapCertificationInputDTO', () => {
  it('should map all fields and set url to null if undefined', () => {
    const input: CertificationInputDTO = {
      name: 'Cert 1',
      issuer: 'Org',
      date: new Date('2024-01-01'),
      url: undefined,
      userId: 'user-1',
    };
    const result = mapCertificationInputDTO(input);
    expect(result).toEqual({
      name: 'Cert 1',
      issuer: 'Org',
      date: new Date('2024-01-01'),
      url: null,
      userId: 'user-1',
    });
  });

  it('should keep url if present', () => {
    const input: CertificationInputDTO = {
      name: 'Cert 2',
      issuer: 'Org',
      date: new Date('2024-01-01'),
      url: 'https://cert.com',
      userId: 'user-2',
    };
    const result = mapCertificationInputDTO(input);
    expect(result.url).toBe('https://cert.com');
  });
});

describe('mapCertificationUpdateInputDTO', () => {
  it('should map only provided fields and set url to null if undefined', () => {
    const input = {
      name: 'Cert 3',
      url: undefined,
    };
    const result = mapCertificationUpdateInputDTO(input);
    expect(result).toEqual({ name: 'Cert 3', url: null });
  });

  it('should map all provided fields', () => {
    const input = {
      name: 'Cert 4',
      issuer: 'Org',
      date: new Date('2024-01-01'),
      url: 'https://cert.com',
      userId: 'user-4',
    };
    const result = mapCertificationUpdateInputDTO(input);
    expect(result).toEqual(input);
  });
});
