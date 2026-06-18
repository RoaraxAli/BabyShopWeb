import { source } from '@/app/source';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import defaultMdxComponents from 'fumadocs-ui/mdx';

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  
  // For documentation, we only want the root pages (not user-guide or developer-guide)
  // If no slug, it's the index page.
  const slug = params.slug || [];
  
  // Prevent accessing user-guide and developer-guide through this route
  if (slug.length > 0 && (slug[0] === 'user-guide' || slug[0] === 'developer-guide')) {
    notFound();
  }
  
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const params = await source.generateParams();
  return params
    .filter((p) => !p.slug || (p.slug[0] !== 'user-guide' && p.slug[0] !== 'developer-guide'))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug || [];
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
