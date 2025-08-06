import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/client/components/ui";
import {
  useDeleteCertification,
  useDeleteCertifications,
} from "@/client/services/api/certifications";
import type { CertificationDTO } from "@/shared/dto";
import { AppAlertDialogComponent } from "~/client/components/app-alert-dialog/app-alert-dialog.component";
import { useClientTranslation } from "~/client/hooks";
import { CertificationsListComponent } from "./components/certification-list/certifications-list.component";

export default function CertificationsPage() {
  const deleteCertification = useDeleteCertification();
  const deleteCertifications = useDeleteCertifications();
  const navigate = useNavigate();
  const { t } = useClientTranslation();
  const [openAlertDeleteMultiple, setOpenAlertDeleteMultiple] = useState(false);
  const [openAlertDelete, setOpenAlertDelete] = useState(false);
  const [selectedCertifications, setSelectedCertifications] = useState<CertificationDTO[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<CertificationDTO | null>(null);

  const handleDeleteCertification = async (cert: CertificationDTO) => {
    try {
      await deleteCertification.mutateAsync({ id: cert.id });
    } catch (err) {
      console.error("Error deleting certification:", err);
    }
  };

  const handleDeleteCertifications = async (certs: CertificationDTO[]) => {
    try {
      await deleteCertifications.mutateAsync({ ids: certs.map((cert) => cert.id) });
    } catch (err) {
      console.error("Error deleting certifications:", err);
    }
  };

  const navigateToCreateCertification = () => {
    navigate({
      to: "/admin/certifications/$id",
      params: { id: "new" },
      from: "/admin/certifications",
    });
  };

  const navigateToUpdateCertification = (cert: CertificationDTO) => {
    navigate({
      to: "/admin/certifications/$id",
      params: { id: cert.id },
      from: "/admin/certifications",
    });
  };

  const handleRequestDeleteCertification = (cert: CertificationDTO) => {
    setSelectedCertification(cert);
    setOpenAlertDelete(true);
  };

  const handleRequestDeleteCertifications = (certs: CertificationDTO[]) => {
    console.log("Selected certifications for deletion:", certs);
    setSelectedCertifications(certs);
    setOpenAlertDeleteMultiple(true);
  };

  const handleConfirmDeleteCertification = async () => {
    if (selectedCertification) {
      await handleDeleteCertification(selectedCertification);
      setOpenAlertDelete(false);
      setSelectedCertification(null);
    }
  };

  const handleConfirmDeleteCertifications = async () => {
    if (selectedCertifications.length > 0) {
      await handleDeleteCertifications(selectedCertifications);
      setOpenAlertDeleteMultiple(false);
      setSelectedCertifications([]);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-xl">{t("admin.certifications.title")}</h2>
        <Button onClick={navigateToCreateCertification} variant={"outline"}>
          {t("admin.certifications.createCertification")}
        </Button>
      </div>
      <CertificationsListComponent
        onEdit={navigateToUpdateCertification}
        onDelete={handleRequestDeleteCertification}
        onDeleteMultiple={handleRequestDeleteCertifications}
      />
      <AppAlertDialogComponent
        isOpen={openAlertDelete}
        onConfirm={handleConfirmDeleteCertification}
        onCancel={() => setOpenAlertDelete(false)}
        title={t("admin.certifications.deleteTitle")}
        description={t("admin.certifications.deleteDescription")}
      />
      <AppAlertDialogComponent
        isOpen={openAlertDeleteMultiple}
        onConfirm={handleConfirmDeleteCertifications}
        onCancel={() => setOpenAlertDeleteMultiple(false)}
        title={t("admin.certifications.deleteMultipleTitle")}
        description={t("admin.certifications.deleteMultipleDescription")}
      />
    </div>
  );
}
