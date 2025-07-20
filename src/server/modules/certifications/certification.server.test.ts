// Mock the createServerFn from @tanstack/react-start
jest.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    return {
      handler: (fn: any) => fn,
      validator: () => ({
        handler: (fn: any) => fn,
      }),
    };
  },
}));

// Define mock before imports and jest.mock setup
const mockService = {
  getAllCertifications: jest.fn(),
  getCertificationById: jest.fn(),
  createCertification: jest.fn(),
  updateCertification: jest.fn(),
  deleteCertification: jest.fn(),
};

// Place jest.mock before any imports
jest.mock("./certification.service", () => ({
  certificationService: mockService,
}));

// Import after mock setup
import type {
  CertificationCreateDTO,
  CertificationUpdateDTO,
} from "../../../shared/dto/certification.dto";
import {
  createCertificationServer,
  deleteCertificationServer,
  getCertification,
  listCertifications,
  updateCertificationServer,
} from "./certification.server";

describe("certification.server", () => {
  const mockCert = {
    name: "Cert",
    id: "id1",
    issuer: "Org",
    date: new Date("2024-01-01"),
    url: null,
    userId: "u1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("listCertifications should call getAllCertifications", async () => {
    mockService.getAllCertifications.mockResolvedValue([mockCert]);
    const result = await listCertifications();
    console.log("RESULT", result);
    expect(mockService.getAllCertifications).toHaveBeenCalled();
    expect(result).toEqual([mockCert]);
  });

  it("getCertification should call getCertificationById with id", async () => {
    mockService.getCertificationById.mockResolvedValue(mockCert);
    const ctx = { data: { id: "id1" } };
    const result = await getCertification(ctx);
    expect(mockService.getCertificationById).toHaveBeenCalledWith("id1");
    expect(result).toBe(mockCert);
  });

  it("createCertificationServer should call createCertification with mapped data", async () => {
    mockService.createCertification.mockResolvedValue(mockCert);
    const input: CertificationCreateDTO = {
      name: "Cert",
      issuer: "Org",
      date: new Date("2024-01-01"),
      url: undefined,
      userId: "u1",
    };
    const result = await createCertificationServer({ data: input });
    expect(mockService.createCertification).toHaveBeenCalled();
    expect(result).toBe(mockCert);
  });

  it("updateCertificationServer should call updateCertification with mapped data", async () => {
    mockService.updateCertification.mockResolvedValue(mockCert);
    const input: CertificationUpdateDTO = {
      id: "id1",
      data: { name: "Cert", url: undefined },
    };
    const result = await updateCertificationServer({ data: input });
    const calledArgs = mockService.updateCertification.mock.calls[0];
    expect(calledArgs[0]).toBe("id1");
    expect(calledArgs[1].name).toBe("Cert");
    // Accept both cases: url: null or url omitted
    expect(Object.hasOwn(calledArgs[1], "url") ? calledArgs[1].url : null).toBe(
      null,
    );
    expect(result).toBe(mockCert);
  });

  it("deleteCertificationServer should call deleteCertification with id", async () => {
    mockService.deleteCertification.mockResolvedValue(mockCert);
    const ctx = { data: { id: "id1" } };
    const result = await deleteCertificationServer(ctx);
    expect(mockService.deleteCertification).toHaveBeenCalledWith("id1");
    expect(result).toBe(mockCert);
  });
});
