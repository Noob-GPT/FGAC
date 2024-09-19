import {useEffect, useRef, useState} from 'react';
import {Chat, Input} from '@components';
import Box from '@mui/material/Box';
import {useParams} from 'react-router-dom';
import {DropEvent, FileRejection, useDropzone} from 'react-dropzone';
import {uploadImage} from '@utils';
import { Skeleton } from '@mui/material';

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
    const [isLoading, setIsLoading] = useState(true); // 응답 대기 상태 추가

    // 세션 스토리지에서 채팅 기록 가져오기
    useEffect(() => {
        const data = sessionStorage.getItem(stepId || 'step1');
        const parsedData = data ? JSON.parse(data) : [];

        setChatData(prevChatData => ({...prevChatData, [stepId || 'step1']: parsedData}));
        setIsLoading(false); // 데이터 로딩 완료 시 상태 변경
    }, [stepId]);

    // 채팅을 보내면 스크롤 포커스를 밑으로 이동
    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [chatData, uploadedImageUrl]);

    // 이미지 파일을 업로드하고 업로드된 이미지의 링크를 저장함
    const handleImageUpload = async (file: File) => {
        const imageUrl = await uploadImage(file);
        console.log('imageUrl', imageUrl);

        if (imageUrl)
            setUploadedImageUrl(imageUrl);
    };

    // 드래그 앤 드롭
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
            <Box flexGrow={1} width={'100%'} overflow={'auto'} p={'0 0 16px 17px'}>
                <Box maxWidth={800} m={'auto'}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" width="100%" height={400} />
                    ) : (
                        (chatData[stepId || 'step1'] || []).map((data, index) => (
                            <Chat key={index} data={data} />
                        ))
                    )}
                    <div ref={scrollRef}/>
                </Box>
            </Box>
            <Box maxWidth={800} width={'100%'} mb={2}>
                <Input
                    setChatData={setChatData}
                    uploadedImageUrl={uploadedImageUrl}
                    setUploadedImageUrl={setUploadedImageUrl}
                    onImageUpload={handleImageUpload}/>
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
