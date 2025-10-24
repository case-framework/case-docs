import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ImageProps } from 'next/image';
import Video, { VideoProps } from './components/content-items/video';
import { joinPath } from './components/utils';
import ExampleBox, { ExampleBoxProps } from './components/content-items/example-box';
import ApiDoc from './components/api-doc';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as ImageProps)}
      className='p-2 bg-neutral-200 rounded-xl'
      width={props.width || 700} // standard height if not defined in mdx
      height={props.height || 350} // standard height if not defined in mdx
    />,

    Video: (props) => <Video {...(props as VideoProps)}
      videoPath={joinPath(basePath, (props as VideoProps).videoPath)}
    />,
    ExampleBox: (props) => <ExampleBox {...(props as ExampleBoxProps)} />,
    ApiDoc: (props) => <ApiDoc {...props} />,
    ...components,
  };
}

