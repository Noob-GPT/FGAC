import {useEffect, useRef, useState} from 'react';
import {Chat, Input} from '@components';
import Box from '@mui/material/Box';
import {useParams} from 'react-router-dom';
import {DropEvent, FileRejection, useDropzone} from 'react-dropzone';
import {uploadImage} from '@utils';
import {Divider, Skeleton} from '@mui/material';

interface ChatData {
    role: string;
    content: Array<{
        type: string;
        text?: string;
        image_url?: { url: string };
    }>;
}

export default function MainPage() {
    const {stepId} = useParams<{ stepId: string }>();
    const [chatData, setChatData] = useState<{ [key: string]: ChatData[] }>({});
    const scrollRef = useRef<HTMLDivElement>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 로딩 상태 props로 넘겨주기 위한 콜백
    const handleLoadingChange = (loading: boolean) => {
        setIsLoading(loading);
    };

    useEffect(() => {
        const fetchData = () => {
            const data = sessionStorage.getItem(`chatMessages_${stepId}`);
            const parsedData = data ? JSON.parse(data) : [];
            setChatData(prevChatData => ({...prevChatData, [stepId as string]: parsedData}));
        };

        fetchData();
    }, [stepId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [chatData, uploadedImageUrl]);

    const handleImageUpload = async (file: File) => {
        const imageUrl = await uploadImage(file);
        console.log('imageUrl', imageUrl);

        if (imageUrl)
            setUploadedImageUrl(imageUrl);
    };

    const {getRootProps, isDragActive} = useDropzone({
        onDrop: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
            const dragEvent = event as DragEvent;
            const text = dragEvent.dataTransfer?.getData('text');
            if (text && text.startsWith('http')) {
                setUploadedImageUrl(text);
            } else {
                const file = acceptedFiles[0];

                if (file && file.type.startsWith('image/'))
                    handleImageUpload(file);
            }
        },
        accept: {'image/*': []}, // 이미지 파일만 허용
        noClick: true // 클릭 시 파일 탐색기 열리지 않도록 설정
    });

    return (
        <Box
            position={'relative'}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            height={'100vh'}
            width={'100%'}
            {...getRootProps()}
        >
            <Box flexGrow={1} width={'100%'} overflow={'auto'} p={'16px 17px 0px 17px'}>
                <Box maxWidth={800} m={'auto'}>
                    {(chatData[stepId || 'step1'] || []).map((data, index) => (
                        <Chat key={index} data={data}/>
                    ))}
                    {isLoading && (
                        <>
                            <Skeleton variant="text" width="60%" height={32}/>
                            <Divider/>
                            <Skeleton variant="rectangular" height={100} style={{marginTop: 16}}/>
                        </>
                    )}
                    <div ref={scrollRef}/>
                </Box>
            </Box>
            <Box maxWidth={800} width={'100%'} pt={2} pb={2} pl={2} pr={2}>
                <Input
                    setChatData={setChatData}
                    uploadedImageUrl={uploadedImageUrl}
                    setUploadedImageUrl={setUploadedImageUrl}
                    onImageUpload={handleImageUpload}
                    onLoadingChange={handleLoadingChange}
                />
            </Box>
            {isDragActive && (
                <Box
                    position={'absolute'}
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgcolor={'rgba(0, 0, 0, 0.5)'}
                    zIndex={9999}
                    display={'flex'}
                    justifyContent={'center'}
                    alignItems={'center'}
                    color={'#FFF'}
                >
                    여기에 사진을 드롭하세요
                </Box>
            )}
        </Box>
    );
}
