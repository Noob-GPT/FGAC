import {ChangeEvent, Dispatch, KeyboardEvent, SetStateAction, SyntheticEvent, useEffect, useState} from 'react';
import {Alert, Box, IconButton, InputAdornment, Snackbar, SnackbarCloseReason, TextField} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {sendImageMessageAuto} from '@utils';
import {useParams} from 'react-router-dom';

interface ChatData {
    role: string;
    content: Array<{
        type: string;
        text?: string;
        image_url?: { url: string };
    }>;
}

interface InputProps {
    setChatData: Dispatch<SetStateAction<{ [key: string]: ChatData[] }>>;
    onLoadingChange: (loading: boolean) => void;
}

export default function Input({setChatData, onLoadingChange}: InputProps) {
    const [inputValue, setInputValue] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const {stepId} = useParams<{ stepId: string }>();
    const [visitedSteps, setVisitedSteps] = useState(() => JSON.parse(sessionStorage.getItem('visitedSteps') || '{}'));

    const fixedPrompts: Record<number, string> = {
        // 캐드 도면 이미지 삽입
        1: 'CAD 도면 이미지를 업로드 할거야 한국어로 알려줘',
        // 건축공간 특성 조사
        2: '사진을 보고 건물의 용도, 규모, 건축면적, 연면적(지하층, 지상층)을 찾아줘. 문 개수와 크기도 알려줘. 그리고 사진에서 찾은 용도를 기반으로 대표적인 가연물 3가지를 찾아줘',
        // 관련 법규조항 조사
        3: '사진을 보고 건물의 용도, 규모, 건축면적, 연면적을 기반으로 관련된 대한민국 건축법과 소방법에 해당하는 조항을 찾아줘',
        // 가연물 피난자 특성
        4: '사진에서 찾은 용도의 수용인원 산정 기준(제곱미터/인원)과 바단 번적 곱한 값을 알려줘. 그리고 사진에서의 용도, 규모, 건축면적, 연면적에서 화재가 일어났을 경우 피난하는 사람들의 특성을 논문이나 기사에서 5가지만 찾아서 설명해줘',
        // 피난 시나리오 작성
        5: '전에 대화했던 내용과 사진을 기반으로, 피난 시나리오 7가지를 작성해줘',
        // 피난 시간 계산
        6: '전에 대화했던 내용과 사진을 기반으로, 각 시나리오에 대한 피난 시간을 계산해줘',
        // 개선안 도출
        7: '전에 대화했던 내용과 사진을 기반으로, 개선안을 도출해줘',
    };

// 입력 탭이 변경되면 프롬프트를 서버에 보내고 응답을 받음
    useEffect(() => {
        if (stepId == null)
            return;

        const stepIdNumber = parseInt(stepId, 10);

        // step을 처음 방문했는지 확인
        if (!visitedSteps[stepId]) {
            const fixedPrompt = fixedPrompts[stepIdNumber];

            // 고정 프롬프트 추가
            if (fixedPrompt) {
                setChatData(prevChatData => {
                    const newChatData = [...(prevChatData[stepId || 'step1'] || [])];

                    // 고정 프롬프트를 user 역할로 추가
                    newChatData.push({
                        role: 'user',
                        content: [{
                            type: 'text',
                            text: fixedPrompt
                        }]
                    });

                    // 이미지가 존재하는 경우 content에 이미지 URL을 추가
                    const imageUrls = JSON.parse(sessionStorage.getItem("imageUrls") || '[]');
                    if (imageUrls.length > 0) {
                        const lastChatEntry = newChatData[newChatData.length - 1];
                        imageUrls.forEach((imageUrl: string) => {
                            lastChatEntry.content.push({
                                type: 'image_url',
                                image_url: {url: imageUrl}
                            });
                        });
                    }

                    // 세션 스토리지에 고정 프롬프트 저장
                    setSessionData(newChatData, stepId);

                    return {
                        ...prevChatData,
                        [stepId || '1']: newChatData
                    };
                });

                // GPT API로 고정 프롬프트와 이미지 URL 전송
                const sendFixedPrompt = async () => {
                    onLoadingChange(true);
                    try {
                        // 이미지를 포함해 GPT 요청
                        const data = await sendImageMessageAuto(fixedPrompt);
                        // 응답 데이터 저장
                        saveChatData(data);
                    } catch (error) {
                        setAlertMessage('요청을 처리하는 중에 오류가 발생했습니다.');
                        setAlertOpen(true);
                    } finally {
                        onLoadingChange(false);
                    }
                };

                // fetch 요청 실행
                sendFixedPrompt();

                // 방문 기록 추가
                setVisitedSteps((prev: { [key: string]: boolean }) => ({
                    ...prev,
                    [stepId]: true
                }));

            }
        }
    }, [stepId, visitedSteps]);


    // 채팅 상태 업데이트
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    function saveUserChatData() {
        const imageUrls = JSON.parse(sessionStorage.getItem("imageUrls") || '[]');

        if (imageUrls == null) {
            setAlertMessage('먼저 사진을 넣어주세요');
            setAlertOpen(true);
        }

        if (inputValue.trim()) {
            // const imgUrl = uploadedImageUrl;

            // 채팅 데이터 저장
            setChatData(prevChatData => {
                const newChatData = [...(prevChatData[stepId || '1'] || [])];
                // const markdownImage = uploadedImageUrl ? `![image](${uploadedImageUrl})\n\n` : '';

                // 사용자가 입력한 채팅 내용 저장
                newChatData.push({
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: inputValue // 입력 텍스트
                    }]
                });

                // 방금 추가한 텍스트 메시지의 content 배열에 이미지 URL을 추가
                const lastChatEntry = newChatData[newChatData.length - 1]; // 방금 추가한 항목

                // imageUrls 배열의 각 이미지 주소를 content 배열에 추가
                imageUrls.forEach((imageUrl: string) => {
                    lastChatEntry.content.push({
                        type: 'image_url',
                        image_url: {url: imageUrl}
                    });
                });
                //`${markdownImage}${inputValue}`

                setInputValue('');
                setSessionData(newChatData, stepId || '1');

                return {
                    ...prevChatData,
                    [stepId || '1']: newChatData
                };
            });
        }
    }

    // 서버에 api 요청 후 데이터 받기
    const handleSend = async () => {
        saveUserChatData();

        onLoadingChange(true);

        try {
            // setRecentImageUrl(uploadedImageUrl);
            // setUploadedImageUrl(null)
            let data;
            // 이미지를 포함해 GPT 요청
            data = await sendImageMessageAuto(inputValue);
            // 응답 데이터 저장
            saveChatData(data);
        } catch (error) {
            setAlertMessage('요청을 처리하는 중에 오류가 발생했습니다.');
            setAlertOpen(true);
        } finally {
            onLoadingChange(false);
        }
    };

    // 응답 데이터 저장
    const saveChatData = (response: Array<{
        index: number,
        message: { role: string, content: string },
        logprobs: any,
        finish_reason: string
    }>) => {
        setChatData(prevChatData => {
            const newChatData = [...(prevChatData[stepId || 'step1'] || [])];

            response.forEach(res => {
                // 응답을 GPT API 형식에 맞게 변환한 후 저장
                let resData = {
                    role: 'assistant',
                    content: [{
                        type: "text",
                        text: res.message.content
                    }]
                }
                newChatData.push(resData);
            });

            // 세션스토리지에 새로운 대화내역을 추가하여 저장
            setSessionData(newChatData, stepId || '1');

            return {
                ...prevChatData,
                [stepId || '1']: newChatData
            };
        });
    };

    // 세션 스토리지에 채팅 데이터 저장
    const setSessionData = (data: any, stepId: string) => {
        // 모든 대화 내용 저장
        const existingMessages = JSON.parse(sessionStorage.getItem('chatMessages') || '[]');
        const updatedMessages = [...existingMessages, ...data];

        sessionStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        // 탭별 대화 내용 저장
        sessionStorage.setItem(`chatMessages_${stepId}`, JSON.stringify(data));
    };

    // 알림 창 닫기
    const handleAlertClose = (_event: SyntheticEvent<any, Event> | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') // 알림 창 외부를 클릭하여 알림 창이 닫히지 않도록 함
            return;

        setAlertOpen(false);
    };

    // 채팅을 입력하고 엔터를 눌렀을 때
    const handleTextKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <Box>
                <TextField
                    placeholder='AI에게 보내기'
                    multiline
                    fullWidth
                    maxRows={5}
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleTextKeyPress}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <IconButton onClick={handleSend} disabled={!inputValue}>
                                    <SendIcon/>
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: {
                            p: '14px 6px 14px 20px',
                            borderRadius: '24px',
                            backgroundColor: '#F8F8F8'
                        }
                    }}
                />
            </Box>
            <Snackbar
                open={alertOpen}
                autoHideDuration={6000}
                onClose={handleAlertClose}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert onClose={handleAlertClose} severity="error" sx={{width: '100%'}}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
