export interface LocaleVideoProps {
    width?: number;
    height?: number;
    videoPath: string;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function LocaleVideo(props: LocaleVideoProps) {

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <video width={props.width || 700} controls>
                <source
                    src={`${basePath}/${props.videoPath}`}
                    type="video/mp4"
                />
                Your browser does not support the video tag.
            </video>
        </div>
    )
}