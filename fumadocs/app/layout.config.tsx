import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <span className="text-xl">👶</span>
        <span className="font-bold text-base">BabyShopHub Docs</span>
      </>
    ),
  },
  links: [
    {
      text: 'User Guide',
      url: '/documentation/user-guide',
      active: 'nested-url',
    },
    {
      text: 'Developer Guide',
      url: '/documentation/developer-guide',
      active: 'nested-url',
    },
    {
      text: 'GitHub',
      url: 'https://github.com',
      external: true,
    },
  ],
};
