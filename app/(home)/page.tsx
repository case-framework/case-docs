import { Card } from 'fumadocs-ui/components/card';
import Link from 'next/link';
import { BookUser, FolderCog, GitFork, PencilRuler, ShieldUser, LayoutPanelTop, Shield, Globe, Mail } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col px-4 py-12 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">CASE Documentation</h1>
          <p className="text-lg text-fd-muted-foreground max-w-2xl mx-auto">
            Comprehensive guides and technical documentation for the CASE framework -
            from user management to API integration.
          </p>
        </div>

        {/* User Guides Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">User Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
              href="/docs/survey-editor/basics/editor-overview"
              title="Survey Editor"
              description="Documentation for using the graphical survey editor"
              icon={<PencilRuler className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
            <Card
              href="/docs/study-configurator/configurator-overview"
              title="Study Configurator"
              description="Create and configure study settings"
              icon={<FolderCog className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
            <Card
              href="/docs/study-rules-editor/basics/editor-overview"
              title="Study Rules Editor"
              description="Documentation for using the study rules editor"
              icon={<GitFork className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
            <Card
              href="/docs/user-management/participant-users"
              title="User Management"
              description="Functionality for managing user accounts and permissions"
              icon={<ShieldUser className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
            <Card
              href="/docs/participant-management/reports"
              title="Participant Management"
              description="Tools to interact with participant data"
              icon={<BookUser className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
          </div>
        </section>

        {/* Technical Documentation Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Technical Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
              href="/tech-docs/framework/overview"
              title="Framework"
              description="Overview of the technical components of the framework"
              icon={<LayoutPanelTop className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
            <Card
              href="/tech-docs/management-api/overview"
              title="Management API"
              description="Technical documentation for the CASE Management API"
              icon={<Shield className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
            <Card
              href="/tech-docs/participant-api/overview"
              title="Participant API"
              description="API for participant-facing operations"
              icon={<Globe className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
            <Card
              href="/tech-docs/smtp-bridge/overview"
              title="SMTP Bridge"
              description="Email service integration"
              icon={<Mail className="w-6 h-6" />}
              className="[&_div:has(svg)]:shadow"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
