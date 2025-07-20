import * as React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/client/components/ui";
import type { CertificationDTO } from "@/shared/dto";
import { AddCertificationForm, CertificationsDataTable } from "./CertificationsComponents";
import { useCertifications } from "./useCertifications.hook";
import { useDeleteCertification } from "./useDeleteCertification.hook";

export default function CertificationsSection() {
  const { data: certifications = [], isLoading, error } = useCertifications();
  const deleteCertification = useDeleteCertification();

  const handleDeleteCertification = async (data: { id: string }) => {
    try {
      await deleteCertification.mutateAsync(data);
    } catch (err) {
      console.error("Error deleting certification:", err);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-xl">Certifications</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Add Certification</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
            </DialogHeader>
            <AddCertificationForm />
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error.message}</div>
      ) : (
        <CertificationsDataTable
          data={certifications as CertificationDTO[]}
          onEdit={(cert) => (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Certification</DialogTitle>
                </DialogHeader>
                <AddCertificationForm cert={cert} />
              </DialogContent>
            </Dialog>
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
