import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/client/components/ui";
import {
  useDeleteCertification,
  useGetAllCertifications,
} from "@/client/services/api/certifications";
import type { CertificationDTO } from "@/shared/dto";
import { CertificationsListComponent } from "./components/certification-list/certifications-list.component";

export default function CertificationsPage() {
  const { data: certifications = [], isLoading, error } = useGetAllCertifications();
  const deleteCertification = useDeleteCertification();
  const navigate = useNavigate();

  const handleDeleteCertification = async (data: { id: string }) => {
    try {
      await deleteCertification.mutateAsync(data);
    } catch (err) {
      console.error("Error deleting certification:", err);
    }
  };

  const navigateToCreateCertification = () => {
    navigate({
      to: "/admin/certifications/$id",
      params: { id: "new" },
      from: "/admin/certifications",
    });
  };

  const navigateToUpdateCertification = (id: string) => {
    navigate({
      to: "/admin/certifications/$id",
      params: { id },
      from: "/admin/certifications",
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-xl">Certifications</h2>
        <Button onClick={navigateToCreateCertification} size="sm" variant={"outline"}>
          Create Certification
        </Button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error.message}</div>
      ) : (
        <CertificationsListComponent
          data={certifications as CertificationDTO[]}
          onEdit={(cert) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigateToUpdateCertification(cert.id)}
            >
              Edit
            </Button>
          )}
          onDelete={(cert) => (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteCertification({ id: cert.id })}
            >
              Delete
            </Button>
          )}
        />
      )}
    </div>
  );
}
