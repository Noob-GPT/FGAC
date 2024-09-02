import {useEffect, useRef, useState} from 'react';
import {Chat, Input} from '@components';
import Box from '@mui/material/Box';
import {useParams} from 'react-router-dom';
import {useDropzone} from 'react-dropzone';
import {uploadImage} from '@utils';

interface ChatData {
    sender: string;
    content: string;
}

export default function MainPage() {
    const {stepId} = useParams<{ stepId: string }>();
    const [chatData, setChatData] = useState<{ [key: string]: ChatData[] }>({});
    const scrollRef = useRef<HTMLDivElement>(null);

    // 세션 스토리지에서 채팅 기록 가져오기
    useEffect(() => {
        const data = sessionStorage.getItem(stepId || 'step1');
        const parsedData = data ? JSON.parse(data) : [];

        setChatData(prevChatData => ({...prevChatData, [stepId || 'step1']: parsedData}));
    }, [stepId]);

    // 채팅을 보내면 스크롤 포커스를 밑으로 이동
    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [chatData]);

    const handleSend = async (message: string) => {
        const newMessage = {sender: 'USER', content: message};
        const updatedChatData = [...(chatData[stepId || 'step1'] || []), newMessage];

        setChatData(prevChatData => ({
            ...prevChatData,
            [stepId || 'step1']: updatedChatData
        }));

        // 서버에 API 요청 보내기
        const response = await sendMessageToServer(message);
        const serverMessage = {sender: 'FGAC', content: response.content};
        const finalChatData = [...updatedChatData, serverMessage];

        setChatData(prevChatData => ({
            ...prevChatData,
            [stepId || 'step1']: finalChatData
        }));

        // 세션 스토리지에 최종 데이터 저장
        sessionStorage.setItem(stepId || 'step1', JSON.stringify(finalChatData));
    };

    const {getRootProps, isDragActive} = useDropzone({
        onDrop: (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];

            if (file && file.type.startsWith('image/'))
                handleImageUpload(file);
        },
        accept: {'image/*': []}, // 이미지 파일만 허용
        multiple: false, // 한 번에 하나의 파일만 허용
        noClick: true // 클릭 시 파일 탐색기 열리지 않도록 설정
    });

    const handleImagePaste = (image: File) => {
        handleImageUpload(image);
    };

    const handleImageUpload = async (file: File) => {
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
            handleSend(`이미지: ${imageUrl}`);
        }
    };

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
                    {(chatData[stepId || 'step1'] || []).map((data, index) => (
                        <Chat key={index} data={data}/>
                    ))}
                    <div ref={scrollRef}/>
                </Box>
            </Box>
            <Box maxWidth={800} width={'100%'} mb={2}>
                <Input onSend={handleSend} onImagePaste={handleImagePaste}/>
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

async function sendMessageToServer(message: string): Promise<{ content: string }> {
    // 서버에 메시지 보내기 로직
    const response = await fetch('/api/sendMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({message})
    });

    return await response.json();
}
