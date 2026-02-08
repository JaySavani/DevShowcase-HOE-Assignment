"use client";

import { ClipboardCheck, FolderOpen, Shield, Tag } from "lucide-react";

import { AdminApprovals } from "@/components/admin/admin-approvals";
import { AdminCategories } from "@/components/admin/admin-categories";
import { AdminProjects } from "@/components/admin/admin-projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Shield className="text-primary h-5 w-5" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage project submissions, categories, and approvals.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="approvals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:inline-grid lg:w-auto">
          <TabsTrigger value="approvals" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Pending</span> Approvals
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            All Projects
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <AdminApprovals />
        </TabsContent>
        <TabsContent value="projects">
          <AdminProjects />
        </TabsContent>
        <TabsContent value="categories">
          <AdminCategories />
        </TabsContent>
      </Tabs>
    </div>
  );
}
