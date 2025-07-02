'use client';

import { RootProvider } from 'fumadocs-ui/provider';

import SearchDialog from '@/components/search';
import type { ReactNode } from 'react';

const basePath = process.env.BASE_PATH || '';

export function Provider({ children }: { children: ReactNode }) {
    return (
        <RootProvider
            search={{
                SearchDialog,
                options: {
                    api: `${basePath}/api/search`
                }
            }}
        >
            {children}
        </RootProvider>
    );
}