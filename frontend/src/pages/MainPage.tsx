import {useEffect, useRef, useState} from 'react';
import {Chat, Input} from '@components';
import Box from '@mui/material/Box';
import {useParams} from 'react-router-dom';
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
            <Box maxWidth={800} width={'100%'} mb={2}>
                <Input setChatData={setChatData} onLoadingChange={handleLoadingChange}/>
            </Box>
        </Box>
    );
}
