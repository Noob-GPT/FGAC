import {useEffect, useRef, useState} from 'react';
import {Chat, Input} from '@components';
import Box from '@mui/material/Box';
import {useParams} from 'react-router-dom';
import {Divider, Skeleton} from '@mui/material';
import {getSessionChatMessagesByStepId} from '@utils';

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
    const [hasScroll, setHasScroll] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 로딩 상태 props로 넘겨주기 위한 콜백
    const handleLoadingChange = (loading: boolean) => {
        setIsLoading(loading);
    };

    useEffect(() => {
        if (!stepId) return;

        setChatData(prevChatData => ({
            ...prevChatData,
            [stepId]: getSessionChatMessagesByStepId(stepId)
        }));
    }, [stepId]);


    useEffect(() => {
        const scroll = scrollRef.current;

        scroll && setHasScroll(scroll.scrollHeight > scroll.clientHeight);
        scrollEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [chatData]);

    return (
        <Box
            position={'relative'}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            height={'100vh'}
            width={'100%'}
        >
            <Box ref={scrollRef} flexGrow={1} width={'100%'} overflow={'auto'} pl={2} pr={hasScroll ? 2 : 0}>
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
                    <Box ref={scrollEndRef}/>
                </Box>
            </Box>
            <Box maxWidth={800} width={'100%'} p={2}>
                <Input setChatData={setChatData} onLoadingChange={handleLoadingChange}/>
            </Box>
        </Box>
    );
}
