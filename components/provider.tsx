'use client';

import { RootProvider } from 'fumadocs-ui/provider';
import SearchDialog from '@/components/search';
import type { ReactNode } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function Provider({ children }: { children: ReactNode }) {
    console.log(basePath);
    return (
        <RootProvider
            search={{
                options: {
                    api: `${basePath}/api/search`
                },
                SearchDialog,
            }}
        >
            {children}
        </RootProvider>
    );
}