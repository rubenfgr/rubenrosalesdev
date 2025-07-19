
import { Certification } from '@prisma/client';

const mockPrisma = {
  certification: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('../shared/prisma', () => ({
  prisma: mockPrisma,
}));

import { certificationService } from './certification.service';

describe('certification.service', () => {
  const mockCert: Certification = {
    id: 'id1',
    name: 'Cert',
    issuer: 'Org',
    date: new Date('2024-01-01'),
    url: null,
    userId: 'u1',
  } as Certification;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllCertifications should call findMany and return certifications', async () => {
    mockPrisma.certification.findMany.mockResolvedValue([mockCert]);
    const result = await certificationService.getAllCertifications();
    expect(mockPrisma.certification.findMany).toHaveBeenCalledWith({
      orderBy: { date: 'desc' },
      include: { user: true },
    });
    expect(result).toEqual([mockCert]);
  });

  it('getCertificationById should call findUnique and return certification', async () => {
    mockPrisma.certification.findUnique.mockResolvedValue(mockCert);
    const result = await certificationService.getCertificationById('id1');
    expect(mockPrisma.certification.findUnique).toHaveBeenCalledWith({
      where: { id: 'id1' },
      include: { user: true },
    });
    expect(result).toBe(mockCert);
  });

  it('createCertification should call create and return certification', async () => {
    mockPrisma.certification.create.mockResolvedValue(mockCert);
    const data = { name: 'Cert', issuer: 'Org', date: new Date('2024-01-01'), url: null, userId: 'u1' };
    const result = await certificationService.createCertification(data as any);
    expect(mockPrisma.certification.create).toHaveBeenCalledWith({ data });
    expect(result).toBe(mockCert);
  });

  it('updateCertification should call update and return certification', async () => {
    mockPrisma.certification.update.mockResolvedValue(mockCert);
    const result = await certificationService.updateCertification('id1', { name: 'Cert' });
    expect(mockPrisma.certification.update).toHaveBeenCalledWith({ where: { id: 'id1' }, data: { name: 'Cert' } });
    expect(result).toBe(mockCert);
  });

  it('deleteCertification should call delete and return certification', async () => {
    mockPrisma.certification.delete.mockResolvedValue(mockCert);
    const result = await certificationService.deleteCertification('id1');
    expect(mockPrisma.certification.delete).toHaveBeenCalledWith({ where: { id: 'id1' } });
    expect(result).toBe(mockCert);
  });
});
