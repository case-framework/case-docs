import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ImageProps } from 'next/image';
import LocaleVideo from './components/content-items/locale-video';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as ImageProps)}
      className='p-2 bg-neutral-200 rounded-xl'
      width={props.width || 700} // standard height if not defined in mdx
      height={props.height || 350} // standard height if not defined in mdx
    />,
    LocaleVideo: (props) => <LocaleVideo {...(props as LocaleVideoProps)} />,

    ...components,
  };
}
