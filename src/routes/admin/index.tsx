import * as React from 'react';

import { createFileRoute } from '@tanstack/react-router';


import type { AnyFieldApi } from '@tanstack/react-form';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { DataTable } from '~/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { CertificationDTO, CertificationInputDTO } from '../../server/models/certification.model';
import { useCertifications } from './useCertifications.hook';
import { useCreateCertification } from './useCreateCertification.hook';
import { useDeleteCertification } from './useDeleteCertification.hook';
import { useUpdateCertification } from './useUpdateCertification';

function CertificationsDataTable({ data, onEdit, onDelete }: {
  data: CertificationDTO[];
  onEdit: (cert: CertificationDTO) => React.ReactNode;
  onDelete: (cert: CertificationDTO) => React.ReactNode;
}) {
  const [filter, setFilter] = React.useState('');
  const [sortKey, setSortKey] = React.useState<keyof CertificationDTO | null>(null);
  const [sortDesc, setSortDesc] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const pageSize = 10;

  // Filtering
  const filtered = React.useMemo(() => {
    if (!filter) return data;
    const f = filter.toLowerCase();
    return data.filter(cert =>
      cert.name.toLowerCase().includes(f) ||
      cert.issuer.toLowerCase().includes(f)
    );
  }, [data, filter]);

  // Sorting
  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      if (aValue < bValue) return sortDesc ? 1 : -1;
      if (aValue > bValue) return sortDesc ? -1 : 1;
      return 0;
    });
  }, [filtered, sortKey, sortDesc]);

  // Pagination
  const paged = React.useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // Columns
  const columns = [
    {
      accessorKey: 'name',
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort('name')}>Name</button>
      ),
      cell: (info: any) => String(info.getValue()),
    },
    {
      accessorKey: 'issuer',
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort('issuer')}>Issuer</button>
      ),
      cell: (info: any) => String(info.getValue()),
    },
    {
      accessorKey: 'date',
      header: () => (
        <button type="button" className="font-bold" onClick={() => handleSort('date')}>Date</button>
      ),
      cell: (info: any) => info.row.original.date ? new Date(info.row.original.date).toLocaleDateString() : '',
    },
    {
      accessorKey: 'url',
      header: 'URL',
      cell: (info: any) => info.row.original.url ? (
        <a href={info.row.original.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Link</a>
      ) : (
        <span className="text-gray-400">—</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => (
        <div className="flex gap-2">
          {onEdit(info.row.original)}
          {onDelete(info.row.original)}
        </div>
      ),
    },
  ];

  function handleSort(key: keyof CertificationDTO) {
    if (sortKey === key) {
      setSortDesc(d => !d);
    } else {
      setSortKey(key);
      setSortDesc(false);
    }
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          placeholder="Search by name or issuer..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <DataTable columns={columns} data={paged} />
      <div className="flex justify-between items-center mt-2">
        <button
          className="px-2 py-1 border rounded"
          disabled={page === 0}
          onClick={() => handlePageChange(page - 1)}
        >Previous</button>
        <span>Page {page + 1} of {Math.ceil(sorted.length / pageSize)}</span>
        <button
          className="px-2 py-1 border rounded"
          disabled={page + 1 >= Math.ceil(sorted.length / pageSize)}
          onClick={() => handlePageChange(page + 1)}
        >Next</button>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});


function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-red-500 text-xs">{field.state.meta.errors.join(', ')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  );
}
const certificationFormSchema = z.object({
  name: z.string().min(2),
  issuer: z.string().min(2),
  date: z.string().min(4),
  url: z.string().url().or(z.literal('')),
  userId: z.string().min(1),
});

type CertificationFormValues = z.infer<typeof certificationFormSchema>;


function AddCertificationForm({ cert }: { cert?: CertificationDTO }) {
  const createCertification = useCreateCertification();
  const updateCertification = useUpdateCertification();
  const form = useForm({
    defaultValues: {
      name: cert?.name || '',
      issuer: cert?.issuer || '',
      date: cert?.date ? new Date(cert.date).toISOString().split('T')[0] : '',
      url: cert?.url || '',
      userId: cert?.userId || '',
    },
    onSubmit: async (props: { value: CertificationFormValues }) => {
        const { value: values } = props;
        const data: CertificationInputDTO = {
            name: values.name,
            issuer: values.issuer,
            date: new Date(values.date),
            url: values.url || null,
            userId: values.userId,
        };
        console.log('Submitting certification data:', data);
        if (cert && cert.id) {
          await updateCertification.mutateAsync({ id: cert.id, data });
        } else {
          await createCertification.mutateAsync(data);
        }
    },
    validators: {
        onChange: z.object({
          name: z.string().min(2),
          issuer: z.string().min(2),
          date: z.string().min(4),
          url: z.string().url().or(z.literal('')),
          userId: z.string().min(1),
        }),
    },
  });


  return (
      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="name">
          {(field: AnyFieldApi) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium mb-1">Name</label>
              <input
                id={field.name}
                name={field.name}
                placeholder="Name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>
        <form.Field name="issuer">
          {(field: AnyFieldApi) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium mb-1">Issuer</label>
              <input
                id={field.name}
                name={field.name}
                placeholder="Issuer"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>
        <form.Field name="date">
          {(field: AnyFieldApi) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium mb-1">Date</label>
              <input
                id={field.name}
                name={field.name}
                type="date"
                placeholder="Date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>
        <form.Field name="url">
          {(field: AnyFieldApi) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium mb-1">URL</label>
              <input
                id={field.name}
                name={field.name}
                placeholder="URL"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>
        <form.Field name="userId">
          {(field: AnyFieldApi) => (
            <div>
              <label htmlFor={field.name} className="block text-sm font-medium mb-1">User ID</label>
              <input
                id={field.name}
                name={field.name}
                placeholder="User ID"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={e => field.handleChange(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting || createCertification.isPending ? 'Adding...' : 'Add Certification'}
            </Button>
          )}
        </form.Subscribe>
        {createCertification.isError && <div className="text-red-500 text-xs">{createCertification.error.message}</div>}
        {createCertification.isSuccess && <div className="text-green-600 text-xs">Certification added!</div>}
      </form>
  );
}

export default function AdminDashboard() {
  const { data: certifications = [], isLoading, error } = useCertifications();
  const deleteCertification = useDeleteCertification();

  const handleDeleteCertification = async (data: { id: string }) => {
    try {
      await deleteCertification.mutateAsync(data);
    } catch (err) {
      console.error('Error deleting certification:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="certifications">
            <TabsList>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
              <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            <TabsContent value="certifications">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Certifications</h2>
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
                  onEdit={cert => (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Certification</DialogTitle>
                        </DialogHeader>
                        <AddCertificationForm cert={cert} />
                      </DialogContent>
                    </Dialog>
                  )}
                  onDelete={cert => (
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteCertification({ id: cert.id })}>Delete</Button>
                  )}
                />
              )}
            </TabsContent>
            <TabsContent value="projects">
              <div>Manage projects</div>
            </TabsContent>
            <TabsContent value="experience">
              <div>Manage experience</div>
            </TabsContent>
            <TabsContent value="blog">
              <div>Manage blog posts</div>
            </TabsContent>
            <TabsContent value="techstack">
              <div>Manage tech stack</div>
            </TabsContent>
            <TabsContent value="profile">
              <div>Manage profile</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
