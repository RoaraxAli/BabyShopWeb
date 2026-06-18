import React from 'react';
import Link from 'next/link';

export default function GuideSwitcher() {
  return (
    <div className="flex gap-2 p-2 border-b border-gray-200">
      <Link href="/docs/documentation" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
        Documentation
      </Link>
      <Link href="/docs/user-guide" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
        User Guide
      </Link>
      <Link href="/docs/developer-guide" className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">
        Developer Guide
      </Link>
    </div>
  );
}
