/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createServerRootRoute } from '@tanstack/react-start/server'

import { Route as rootRouteImport } from './routes/__root'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AdminIndexRouteImport } from './routes/admin/index'
import { Route as AdminTechstackRouteImport } from './routes/admin/techstack'
import { Route as AdminSettingsRouteImport } from './routes/admin/settings'
import { Route as AdminProjectsRouteImport } from './routes/admin/projects'
import { Route as AdminProfileRouteImport } from './routes/admin/profile'
import { Route as AdminHelpRouteImport } from './routes/admin/help'
import { Route as AdminExperienceRouteImport } from './routes/admin/experience'
import { Route as AdminDashboardRouteImport } from './routes/admin/dashboard'
import { Route as AdminBlogRouteImport } from './routes/admin/blog'
import { Route as AdminUserIndexRouteImport } from './routes/admin/user/index'
import { Route as AdminCertificationsIndexRouteImport } from './routes/admin/certifications/index'
import { Route as AdminUserProfileRouteImport } from './routes/admin/user/profile'
import { Route as AdminUserNotificationsRouteImport } from './routes/admin/user/notifications'
import { Route as AdminCertificationsIdRouteImport } from './routes/admin/certifications/$id'
import { ServerRoute as ApiHealthServerRouteImport } from './routes/api/health'
import { ServerRoute as ApiCertificationsServerRouteImport } from './routes/api/certifications'
import { ServerRoute as ApiExperiencesIndexServerRouteImport } from './routes/api/experiences/index'
import { ServerRoute as ApiCertificationsIndexServerRouteImport } from './routes/api/certifications/index'
import { ServerRoute as ApiExperiencesIdServerRouteImport } from './routes/api/experiences/$id'
import { ServerRoute as ApiCertificationsIdServerRouteImport } from './routes/api/certifications/$id'

const rootServerRouteImport = createServerRootRoute()

const AdminRoute = AdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminIndexRoute = AdminIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AdminRoute,
} as any)
const AdminTechstackRoute = AdminTechstackRouteImport.update({
  id: '/techstack',
  path: '/techstack',
  getParentRoute: () => AdminRoute,
} as any)
const AdminSettingsRoute = AdminSettingsRouteImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => AdminRoute,
} as any)
const AdminProjectsRoute = AdminProjectsRouteImport.update({
  id: '/projects',
  path: '/projects',
  getParentRoute: () => AdminRoute,
} as any)
const AdminProfileRoute = AdminProfileRouteImport.update({
  id: '/profile',
  path: '/profile',
  getParentRoute: () => AdminRoute,
} as any)
const AdminHelpRoute = AdminHelpRouteImport.update({
  id: '/help',
  path: '/help',
  getParentRoute: () => AdminRoute,
} as any)
const AdminExperienceRoute = AdminExperienceRouteImport.update({
  id: '/experience',
  path: '/experience',
  getParentRoute: () => AdminRoute,
} as any)
const AdminDashboardRoute = AdminDashboardRouteImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AdminRoute,
} as any)
const AdminBlogRoute = AdminBlogRouteImport.update({
  id: '/blog',
  path: '/blog',
  getParentRoute: () => AdminRoute,
} as any)
const AdminUserIndexRoute = AdminUserIndexRouteImport.update({
  id: '/user/',
  path: '/user/',
  getParentRoute: () => AdminRoute,
} as any)
const AdminCertificationsIndexRoute =
  AdminCertificationsIndexRouteImport.update({
    id: '/certifications/',
    path: '/certifications/',
    getParentRoute: () => AdminRoute,
  } as any)
const AdminUserProfileRoute = AdminUserProfileRouteImport.update({
  id: '/user/profile',
  path: '/user/profile',
  getParentRoute: () => AdminRoute,
} as any)
const AdminUserNotificationsRoute = AdminUserNotificationsRouteImport.update({
  id: '/user/notifications',
  path: '/user/notifications',
  getParentRoute: () => AdminRoute,
} as any)
const AdminCertificationsIdRoute = AdminCertificationsIdRouteImport.update({
  id: '/certifications/$id',
  path: '/certifications/$id',
  getParentRoute: () => AdminRoute,
} as any)
const ApiHealthServerRoute = ApiHealthServerRouteImport.update({
  id: '/api/health',
  path: '/api/health',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiCertificationsServerRoute = ApiCertificationsServerRouteImport.update({
  id: '/api/certifications',
  path: '/api/certifications',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiExperiencesIndexServerRoute =
  ApiExperiencesIndexServerRouteImport.update({
    id: '/api/experiences/',
    path: '/api/experiences/',
    getParentRoute: () => rootServerRouteImport,
  } as any)
const ApiCertificationsIndexServerRoute =
  ApiCertificationsIndexServerRouteImport.update({
    id: '/',
    path: '/',
    getParentRoute: () => ApiCertificationsServerRoute,
  } as any)
const ApiExperiencesIdServerRoute = ApiExperiencesIdServerRouteImport.update({
  id: '/api/experiences/$id',
  path: '/api/experiences/$id',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiCertificationsIdServerRoute =
  ApiCertificationsIdServerRouteImport.update({
    id: '/$id',
    path: '/$id',
    getParentRoute: () => ApiCertificationsServerRoute,
  } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRouteWithChildren
  '/admin/blog': typeof AdminBlogRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/admin/experience': typeof AdminExperienceRoute
  '/admin/help': typeof AdminHelpRoute
  '/admin/profile': typeof AdminProfileRoute
  '/admin/projects': typeof AdminProjectsRoute
  '/admin/settings': typeof AdminSettingsRoute
  '/admin/techstack': typeof AdminTechstackRoute
  '/admin/': typeof AdminIndexRoute
  '/admin/certifications/$id': typeof AdminCertificationsIdRoute
  '/admin/user/notifications': typeof AdminUserNotificationsRoute
  '/admin/user/profile': typeof AdminUserProfileRoute
  '/admin/certifications': typeof AdminCertificationsIndexRoute
  '/admin/user': typeof AdminUserIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin/blog': typeof AdminBlogRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/admin/experience': typeof AdminExperienceRoute
  '/admin/help': typeof AdminHelpRoute
  '/admin/profile': typeof AdminProfileRoute
  '/admin/projects': typeof AdminProjectsRoute
  '/admin/settings': typeof AdminSettingsRoute
  '/admin/techstack': typeof AdminTechstackRoute
  '/admin': typeof AdminIndexRoute
  '/admin/certifications/$id': typeof AdminCertificationsIdRoute
  '/admin/user/notifications': typeof AdminUserNotificationsRoute
  '/admin/user/profile': typeof AdminUserProfileRoute
  '/admin/certifications': typeof AdminCertificationsIndexRoute
  '/admin/user': typeof AdminUserIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/admin': typeof AdminRouteWithChildren
  '/admin/blog': typeof AdminBlogRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/admin/experience': typeof AdminExperienceRoute
  '/admin/help': typeof AdminHelpRoute
  '/admin/profile': typeof AdminProfileRoute
  '/admin/projects': typeof AdminProjectsRoute
  '/admin/settings': typeof AdminSettingsRoute
  '/admin/techstack': typeof AdminTechstackRoute
  '/admin/': typeof AdminIndexRoute
  '/admin/certifications/$id': typeof AdminCertificationsIdRoute
  '/admin/user/notifications': typeof AdminUserNotificationsRoute
  '/admin/user/profile': typeof AdminUserProfileRoute
  '/admin/certifications/': typeof AdminCertificationsIndexRoute
  '/admin/user/': typeof AdminUserIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admin'
    | '/admin/blog'
    | '/admin/dashboard'
    | '/admin/experience'
    | '/admin/help'
    | '/admin/profile'
    | '/admin/projects'
    | '/admin/settings'
    | '/admin/techstack'
    | '/admin/'
    | '/admin/certifications/$id'
    | '/admin/user/notifications'
    | '/admin/user/profile'
    | '/admin/certifications'
    | '/admin/user'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admin/blog'
    | '/admin/dashboard'
    | '/admin/experience'
    | '/admin/help'
    | '/admin/profile'
    | '/admin/projects'
    | '/admin/settings'
    | '/admin/techstack'
    | '/admin'
    | '/admin/certifications/$id'
    | '/admin/user/notifications'
    | '/admin/user/profile'
    | '/admin/certifications'
    | '/admin/user'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/admin/blog'
    | '/admin/dashboard'
    | '/admin/experience'
    | '/admin/help'
    | '/admin/profile'
    | '/admin/projects'
    | '/admin/settings'
    | '/admin/techstack'
    | '/admin/'
    | '/admin/certifications/$id'
    | '/admin/user/notifications'
    | '/admin/user/profile'
    | '/admin/certifications/'
    | '/admin/user/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRouteWithChildren
}
export interface FileServerRoutesByFullPath {
  '/api/certifications': typeof ApiCertificationsServerRouteWithChildren
  '/api/health': typeof ApiHealthServerRoute
  '/api/certifications/$id': typeof ApiCertificationsIdServerRoute
  '/api/experiences/$id': typeof ApiExperiencesIdServerRoute
  '/api/certifications/': typeof ApiCertificationsIndexServerRoute
  '/api/experiences': typeof ApiExperiencesIndexServerRoute
}
export interface FileServerRoutesByTo {
  '/api/health': typeof ApiHealthServerRoute
  '/api/certifications/$id': typeof ApiCertificationsIdServerRoute
  '/api/experiences/$id': typeof ApiExperiencesIdServerRoute
  '/api/certifications': typeof ApiCertificationsIndexServerRoute
  '/api/experiences': typeof ApiExperiencesIndexServerRoute
}
export interface FileServerRoutesById {
  __root__: typeof rootServerRouteImport
  '/api/certifications': typeof ApiCertificationsServerRouteWithChildren
  '/api/health': typeof ApiHealthServerRoute
  '/api/certifications/$id': typeof ApiCertificationsIdServerRoute
  '/api/experiences/$id': typeof ApiExperiencesIdServerRoute
  '/api/certifications/': typeof ApiCertificationsIndexServerRoute
  '/api/experiences/': typeof ApiExperiencesIndexServerRoute
}
export interface FileServerRouteTypes {
  fileServerRoutesByFullPath: FileServerRoutesByFullPath
  fullPaths:
    | '/api/certifications'
    | '/api/health'
    | '/api/certifications/$id'
    | '/api/experiences/$id'
    | '/api/certifications/'
    | '/api/experiences'
  fileServerRoutesByTo: FileServerRoutesByTo
  to:
    | '/api/health'
    | '/api/certifications/$id'
    | '/api/experiences/$id'
    | '/api/certifications'
    | '/api/experiences'
  id:
    | '__root__'
    | '/api/certifications'
    | '/api/health'
    | '/api/certifications/$id'
    | '/api/experiences/$id'
    | '/api/certifications/'
    | '/api/experiences/'
  fileServerRoutesById: FileServerRoutesById
}
export interface RootServerRouteChildren {
  ApiCertificationsServerRoute: typeof ApiCertificationsServerRouteWithChildren
  ApiHealthServerRoute: typeof ApiHealthServerRoute
  ApiExperiencesIdServerRoute: typeof ApiExperiencesIdServerRoute
  ApiExperiencesIndexServerRoute: typeof ApiExperiencesIndexServerRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/': {
      id: '/admin/'
      path: '/'
      fullPath: '/admin/'
      preLoaderRoute: typeof AdminIndexRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/techstack': {
      id: '/admin/techstack'
      path: '/techstack'
      fullPath: '/admin/techstack'
      preLoaderRoute: typeof AdminTechstackRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/settings': {
      id: '/admin/settings'
      path: '/settings'
      fullPath: '/admin/settings'
      preLoaderRoute: typeof AdminSettingsRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/projects': {
      id: '/admin/projects'
      path: '/projects'
      fullPath: '/admin/projects'
      preLoaderRoute: typeof AdminProjectsRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/profile': {
      id: '/admin/profile'
      path: '/profile'
      fullPath: '/admin/profile'
      preLoaderRoute: typeof AdminProfileRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/help': {
      id: '/admin/help'
      path: '/help'
      fullPath: '/admin/help'
      preLoaderRoute: typeof AdminHelpRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/experience': {
      id: '/admin/experience'
      path: '/experience'
      fullPath: '/admin/experience'
      preLoaderRoute: typeof AdminExperienceRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/dashboard': {
      id: '/admin/dashboard'
      path: '/dashboard'
      fullPath: '/admin/dashboard'
      preLoaderRoute: typeof AdminDashboardRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/blog': {
      id: '/admin/blog'
      path: '/blog'
      fullPath: '/admin/blog'
      preLoaderRoute: typeof AdminBlogRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/user/': {
      id: '/admin/user/'
      path: '/user'
      fullPath: '/admin/user'
      preLoaderRoute: typeof AdminUserIndexRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/certifications/': {
      id: '/admin/certifications/'
      path: '/certifications'
      fullPath: '/admin/certifications'
      preLoaderRoute: typeof AdminCertificationsIndexRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/user/profile': {
      id: '/admin/user/profile'
      path: '/user/profile'
      fullPath: '/admin/user/profile'
      preLoaderRoute: typeof AdminUserProfileRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/user/notifications': {
      id: '/admin/user/notifications'
      path: '/user/notifications'
      fullPath: '/admin/user/notifications'
      preLoaderRoute: typeof AdminUserNotificationsRouteImport
      parentRoute: typeof AdminRoute
    }
    '/admin/certifications/$id': {
      id: '/admin/certifications/$id'
      path: '/certifications/$id'
      fullPath: '/admin/certifications/$id'
      preLoaderRoute: typeof AdminCertificationsIdRouteImport
      parentRoute: typeof AdminRoute
    }
  }
}
declare module '@tanstack/react-start/server' {
  interface ServerFileRoutesByPath {
    '/api/health': {
      id: '/api/health'
      path: '/api/health'
      fullPath: '/api/health'
      preLoaderRoute: typeof ApiHealthServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/certifications': {
      id: '/api/certifications'
      path: '/api/certifications'
      fullPath: '/api/certifications'
      preLoaderRoute: typeof ApiCertificationsServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/experiences/': {
      id: '/api/experiences/'
      path: '/api/experiences'
      fullPath: '/api/experiences'
      preLoaderRoute: typeof ApiExperiencesIndexServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/certifications/': {
      id: '/api/certifications/'
      path: '/'
      fullPath: '/api/certifications/'
      preLoaderRoute: typeof ApiCertificationsIndexServerRouteImport
      parentRoute: typeof ApiCertificationsServerRoute
    }
    '/api/experiences/$id': {
      id: '/api/experiences/$id'
      path: '/api/experiences/$id'
      fullPath: '/api/experiences/$id'
      preLoaderRoute: typeof ApiExperiencesIdServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/certifications/$id': {
      id: '/api/certifications/$id'
      path: '/$id'
      fullPath: '/api/certifications/$id'
      preLoaderRoute: typeof ApiCertificationsIdServerRouteImport
      parentRoute: typeof ApiCertificationsServerRoute
    }
  }
}

interface AdminRouteChildren {
  AdminBlogRoute: typeof AdminBlogRoute
  AdminDashboardRoute: typeof AdminDashboardRoute
  AdminExperienceRoute: typeof AdminExperienceRoute
  AdminHelpRoute: typeof AdminHelpRoute
  AdminProfileRoute: typeof AdminProfileRoute
  AdminProjectsRoute: typeof AdminProjectsRoute
  AdminSettingsRoute: typeof AdminSettingsRoute
  AdminTechstackRoute: typeof AdminTechstackRoute
  AdminIndexRoute: typeof AdminIndexRoute
  AdminCertificationsIdRoute: typeof AdminCertificationsIdRoute
  AdminUserNotificationsRoute: typeof AdminUserNotificationsRoute
  AdminUserProfileRoute: typeof AdminUserProfileRoute
  AdminCertificationsIndexRoute: typeof AdminCertificationsIndexRoute
  AdminUserIndexRoute: typeof AdminUserIndexRoute
}

const AdminRouteChildren: AdminRouteChildren = {
  AdminBlogRoute: AdminBlogRoute,
  AdminDashboardRoute: AdminDashboardRoute,
  AdminExperienceRoute: AdminExperienceRoute,
  AdminHelpRoute: AdminHelpRoute,
  AdminProfileRoute: AdminProfileRoute,
  AdminProjectsRoute: AdminProjectsRoute,
  AdminSettingsRoute: AdminSettingsRoute,
  AdminTechstackRoute: AdminTechstackRoute,
  AdminIndexRoute: AdminIndexRoute,
  AdminCertificationsIdRoute: AdminCertificationsIdRoute,
  AdminUserNotificationsRoute: AdminUserNotificationsRoute,
  AdminUserProfileRoute: AdminUserProfileRoute,
  AdminCertificationsIndexRoute: AdminCertificationsIndexRoute,
  AdminUserIndexRoute: AdminUserIndexRoute,
}

const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren)

interface ApiCertificationsServerRouteChildren {
  ApiCertificationsIdServerRoute: typeof ApiCertificationsIdServerRoute
  ApiCertificationsIndexServerRoute: typeof ApiCertificationsIndexServerRoute
}

const ApiCertificationsServerRouteChildren: ApiCertificationsServerRouteChildren =
  {
    ApiCertificationsIdServerRoute: ApiCertificationsIdServerRoute,
    ApiCertificationsIndexServerRoute: ApiCertificationsIndexServerRoute,
  }

const ApiCertificationsServerRouteWithChildren =
  ApiCertificationsServerRoute._addFileChildren(
    ApiCertificationsServerRouteChildren,
  )

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRouteWithChildren,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
const rootServerRouteChildren: RootServerRouteChildren = {
  ApiCertificationsServerRoute: ApiCertificationsServerRouteWithChildren,
  ApiHealthServerRoute: ApiHealthServerRoute,
  ApiExperiencesIdServerRoute: ApiExperiencesIdServerRoute,
  ApiExperiencesIndexServerRoute: ApiExperiencesIndexServerRoute,
}
export const serverRouteTree = rootServerRouteImport
  ._addFileChildren(rootServerRouteChildren)
  ._addFileTypes<FileServerRouteTypes>()
