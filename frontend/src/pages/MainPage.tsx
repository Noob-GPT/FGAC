import {useEffect, useRef, useState} from 'react';
import {Chat, Input} from '@components';
import Box from '@mui/material/Box';
import {useParams} from 'react-router-dom';

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
        // const response = await sendMessageToServer(message);
        // const serverMessage = {sender: 'SERVER', content: response.content};
        const serverMessage = {sender: 'FGAC', content: 'hello'};

        const finalChatData = [...updatedChatData, serverMessage];
        setChatData(prevChatData => ({
            ...prevChatData,
            [stepId || 'step1']: finalChatData
        }));

        // 세션 스토리지에 최종 데이터 저장
        sessionStorage.setItem(stepId || 'step1', JSON.stringify(finalChatData));
    };


    return (
        <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            height={'100vh'}
            width={'100%'}
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
                <Input onSend={handleSend}/>
            </Box>
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
    const data = await response.json();
    return data;
}
