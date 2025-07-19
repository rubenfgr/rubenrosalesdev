import { createFileRoute } from '@tanstack/react-router';


import { useCertifications } from './useCertifications.hook';
import type { CertificationDTO, CertificationInputDTO } from '../../server/models/certification.model';
import { useCreateCertification } from './useCreateCertification.hook';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { useForm } from '@tanstack/react-form';
import type { AnyFieldApi } from '@tanstack/react-form';

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
  url: z.string().url().optional().or(z.literal('')),
  userId: z.string().min(1),
});

type CertificationFormValues = z.infer<typeof certificationFormSchema>;


function AddCertificationForm() {
  const mutation = useCreateCertification();
  const form = useForm({
    defaultValues: {
      name: '',
      issuer: '',
      date: '',
      url: '',
      userId: '',
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
              {isSubmitting || mutation.isPending ? 'Adding...' : 'Add Certification'}
            </Button>
          )}
        </form.Subscribe>
        {mutation.isError && <div className="text-red-500 text-xs">{mutation.error.message}</div>}
        {mutation.isSuccess && <div className="text-green-600 text-xs">Certification added!</div>}
      </form>
  );
}

export default function AdminDashboard() {
  const { data: certifications = [], isLoading, error } = useCertifications();
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
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded shadow">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Issuer</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">URL</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(certifications as CertificationDTO[]).map(cert => (
                        <tr key={cert.id} className="border-t">
                          <td className="px-4 py-2">{cert.name}</td>
                          <td className="px-4 py-2">{cert.issuer}</td>
                          <td className="px-4 py-2">{cert.date ? new Date(cert.date).toLocaleDateString() : ''}</td>
                          <td className="px-4 py-2">
                            {cert.url ? (
                              <a href={cert.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Link</a>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">Edit</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Certification</DialogTitle>
                                </DialogHeader>
                                {/* TODO: Edit Certification Form */}
                                <div>Form goes here</div>
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" variant="destructive">Delete</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
