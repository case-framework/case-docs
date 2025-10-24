'use client';

import {
    SearchDialog,
    SearchDialogClose,
    SearchDialogContent,
    SearchDialogHeader,
    SearchDialogIcon,
    SearchDialogInput,
    SearchDialogList,
    SearchDialogOverlay,
    type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { create } from '@orama/orama';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { usePathname } from 'next/navigation';

function initOrama() {
    return create({
        schema: { _: 'string' },
        // https://docs.orama.com/open-source/supported-languages
        language: 'english',
    });
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';


export default function DefaultSearchDialog(props: SharedProps) {

    const pathname = usePathname();
    const { locale } = useI18n(); // (optional) for i18n
    const apiPath = pathname.startsWith('/tech-docs') ? '/api/search-tech-docs' : '/api/search';
    const { search, setSearch, query } = useDocsSearch({
        type: 'static',
        from: `${basePath}${apiPath}`,
        initOrama,
        locale,
    });

    return (
        <SearchDialog
            search={search}
            onSearchChange={setSearch}
            isLoading={query.isLoading}
            {...props}
        >
            <SearchDialogOverlay />
            <SearchDialogContent>
                <SearchDialogHeader>
                    <SearchDialogIcon />
                    <SearchDialogInput />
                    <SearchDialogClose />
                </SearchDialogHeader>
                <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
            </SearchDialogContent>
        </SearchDialog>
    );
}