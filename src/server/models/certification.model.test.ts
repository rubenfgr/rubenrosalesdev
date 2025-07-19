import { CertificationInput, CertificationUpdateInput, CertificationId } from './certification.model';

describe('CertificationInput schema', () => {
  it('validates correct input', () => {
    const input = {
      name: 'Cert',
      issuer: 'Org',
      date: new Date('2024-01-01'),
      url: 'https://cert.com',
      userId: 'u1',
    };
    expect(() => CertificationInput.parse(input)).not.toThrow();
  });

  it('validates with url null', () => {
    const input = {
      name: 'Cert',
      issuer: 'Org',
      date: new Date('2024-01-01'),
      url: null,
      userId: 'u1',
    };
    expect(() => CertificationInput.parse(input)).not.toThrow();
  });

  it('fails if required fields are missing', () => {
    expect(() => CertificationInput.parse({})).toThrow();
  });

  it('fails if date is not a Date', () => {
    const input = {
      name: 'Cert',
      issuer: 'Org',
      date: '2024-01-01',
      userId: 'u1',
    };
    expect(() => CertificationInput.parse(input)).toThrow();
  });
});

describe('CertificationUpdateInput schema', () => {
  it('validates correct input', () => {
    const input = {
      id: 'id1',
      data: { name: 'Cert', url: null },
    };
    expect(() => CertificationUpdateInput.parse(input)).not.toThrow();
  });

  it('fails if id is missing', () => {
    expect(() => CertificationUpdateInput.parse({ data: {} })).toThrow();
  });

  it('fails if data is not an object', () => {
    expect(() => CertificationUpdateInput.parse({ id: 'id1', data: 'not-an-object' })).toThrow();
  });
});

describe('CertificationId schema', () => {
  it('validates correct input', () => {
    expect(() => CertificationId.parse({ id: 'id1' })).not.toThrow();
  });

  it('fails if id is missing', () => {
    expect(() => CertificationId.parse({})).toThrow();
  });

  it('fails if id is not a string', () => {
    expect(() => CertificationId.parse({ id: 123 })).toThrow();
  });
});
