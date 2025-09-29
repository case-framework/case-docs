import { ReactNode } from "react";

export type ExampleBoxProps = {
    title: string;
    children: ReactNode;
};

const ExampleBox = ({ title, children }: ExampleBoxProps) => (
    <div className='text-sm border border-border rounded-lg bg-slate-50 text-muted-foreground'>
        <div className='px-4 py-2 font-semibold border-b border-border bg-slate-100'>{title}</div>
        <div className='px-4'>
            {children}
        </div>
    </div>
);

export default ExampleBox;