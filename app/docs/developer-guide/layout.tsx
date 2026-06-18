"use client";

import { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/app/source';
import '../docs.css';

export default function Layout({ children }: { children: ReactNode }) {
  // Only include developer guide pages
  const filteredTree = source.pageTree.filter((node: any) => node.slug?.[0] === 'developer-guide');
  return (
    <RootProvider>
      <DocsLayout tree={filteredTree}>{children}</DocsLayout>
    </RootProvider>
  );
}
