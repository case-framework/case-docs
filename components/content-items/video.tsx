export interface VideoProps {
    width?: number;
    height?: number;
    videoPath: string;
}

export default function Video(props: VideoProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <video
                width={props.width || 700}
                height={props.height}
                controls
                style={{ maxWidth: '100%' }}
            >
                <source
                    src={props.videoPath}
                    type="video/mp4"
                />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}