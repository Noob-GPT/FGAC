import React, {ChangeEvent, Dispatch, KeyboardEvent, SetStateAction, SyntheticEvent, useEffect, useState} from 'react';
import {
    Alert,
    Box, Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    IconButton,
    InputAdornment,
    Snackbar,
    SnackbarCloseReason,
    TextField
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SendIcon from '@mui/icons-material/Send';
import {useParams} from 'react-router-dom';
import {
    getSessionChatMessages,
    getSessionChatMessagesByStepId,
    getSessionImageUrls,
    getSessionVisitedSteps,
    sendImageMessage,
    setSessionChatMessages,
    setSessionVisitedSteps
} from '@utils';

export interface ChatData {
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
    const [firstBuildingDetail, setFirstBuildingDetail] = useState<string | null>(null);
    const [secondBuildingDetail, setSecondBuildingDetail] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogInputValue, setDialogInputValue] = useState('');
    const [resolveInputPromise, setResolveInputPromise] = useState<((value: string) => void) | null>(null);

    const fixedPrompts: Record<number, string> = {
        // 캐드 도면 이미지 삽입
        1: 'CAD 도면 이미지와 건물 개요 사진을 업로드 할거야 한국어로 알려줘',

        // 건축공간 특성 조사
        2: '이 파일의 건물을 분석해서 건물의 용도와 규모, 연면적과 건축면적등을 분석해서 알려줘(한국어로)',
        // 선택 질문
        // 사진에서의 **지상 3층**에 대한 정보가 궁금해. 위 파일을 참고해서 지상 3층의 용도, 바닥면적, 층의 높이, 도면에서 확인할 수 있는 창의 면적, 문의 면적, 창의 높이, 문의 높이를 분석해줘.

        // 입력을 받으면 다음 질문 실행
        // **침실2** 공간에 대한 정보만 추려줘. 용도, 바닥 면적, 층의 높이, 창의 면적, 문의 면적, 창의 높이, 문의 높이에 대한 수치가 필요해.

        // 관련 법규조항 조사
        3: '그럼 파악한 연면적, 바닥면적, 건축면적등 찾은 정보를 이용해서 건축법시행령, 건축물의 소방시설 설치기준에 준수하여 건축법과 소방법(다양한 소방법에서도 정확히 어떤 법률을 사용해야 하는지)의 용도를 구분하여 소방설치 권장사항을 제안해줘.(근거되는 법령이 몇조 몇항인지 자세히 적어줘.)',
        // 수용인원 산정 조사
        4: '내가 알고싶어한 공간의 이름과 바닥면적이 어떻게 돼? 그리고 건물의 용도는 뭐였어? 이를 기반으로 화재 및 피난 시뮬레이션 시나리오 작성 기준(제4조 관련)에 따라 수용인원 산정을 위해 소방법과 건축법의 기준을 각각 적용하여 계산해줘.',
        // 가연물 특성조사
        5: '이 공간에서의 대표가연물과, 가연물의 특성을 성능기준안전설계 보고서 작성에 용이하도록 알려주는데 이 공간에서의 대표가연물을 선정한 이유에 대한 출처도 꼭 알려줘',
        // 피난인의 특성
        6: '건물의 용도는 뭐였어? 해당 건물 용도에서 피난인의 특성은 어떤게 있는지 논문 등을 참고해서 출처와 함께 자세히 알려줘.',
        // 화재하중과 열방출률 조사
        7: '지금까지 찾았던 건축물의 용도별로 대표적인 화재하중값(KJ/m2)을 알려주는데 찾은 이 값의 출처도 함께 알려줘. 그리고 위에서 찾은 대표가연물의 열방출률을 가장 많이 발생한 대표가연물인 동시에 높은 열방출률을 가졌던 값을 출처와 함께 2~3개 알려줘. 이를 화재성장속도중 적절한 속도를 대입해서 계산를 하고 성장-지속-감쇠가 고려된 화재설계 그래프를 그려줘.(화재성장 4가지 등급 중에서 그 화재성장 등급을 선택한 이유도 같이 알려줘.)',
        // 피난 시나리오 작성
        8: '이 건물의 용도는 뭐였어? 해당 용도와 유사한 용도의 화재사례를 분석해서 시나리오를 자세히 작성해줘. 이 때 1번 시나리오는 초기 화재 단계, 2번 연기 확산으로 인한 대피, 3번 화염 확산으로 인한 대피, 4번 야간 시간대 화재로 인한 대피, 5번 다수 거주자의 동시 피난 시나리오, 6번 장애인 및 이동 제한 거주자의 피난, 7번 피난 경로의 폐쇄로 인한 대피; 이 7가지에 대한 시나리오를 작성해줘',
        // 선택 질문
        // 이 7가지 시나리오 중에서 대피 경로 최적화의 시나리오는 몇번 시나리오인지 자세한 이유와 함께 알려줘

        // ASET 계산
        9: '사진에서 확인할 수 있는 바닥면적, 창의 면적, 문의 면적, 창의 높이, 문의 높이가 어떻게 돼? 이를 사용해서 거실 허용 피난 시간과 플래쉬오버 도달 시간을 계산해서 자세한 식도 알려줘. 플래쉬오버 온도는 500°C, 열방출률은 대표 가연물(예: 폴리우레탄 폼)의 값을 사용하고, kpc 값은 적합한 건축 재료를 기준으로 적용해줘.',
        // RSET 계산
        10: '내가 알고싶어한 공간의 이름과 바닥면적, 피난문 폭이 얼마였어? 이걸로 RSET의 시간을 알려줘(사진에서 보여준 거실피난시간과 발화실의 피난 개시시간을 다 더한 RSET의 값을 알려줘. 이때 거실피난시간은 사진의 식 차례대로 모든 결과를 풀이와 함께 정리해서 알려줘)',
        // 피난 시간 비교
        11: '위에서 계산한 ASET계산의 플래쉬오버도달시간과 거실허용피난시간을 각각 RSET계산 결과를 비교한 후(2개의 결론이 나와야해) 안전한 피난인지 불안전한 피난인지 정확하게 파악해서 알려줘',
        // 개선안 도출
        12: '불안전한 피난인 경우로만 건물의 구조적 특성, 사용하는 인원, 용도, 대피 인원의 특성을 고려해서 안전한 피난이 나올 수 있도록 개선안을 도출해줘',
        // 선택 질문
        // 각 개선안에 대해 비용이 얼마정도 드는지 대략적으로 알려줘.
    };

    const setChatAndSessionMessages = (message: string) => {
        if (stepId == null) return;

        const newChat: ChatData = {
            role: 'user',
            content: [{
                type: 'text',
                text: message
            }]
        };

        // 세션 스토리지에 고정 프롬프트 또는 추가 질문 저장
        setSessionChatMessages(newChat, stepId);

        setChatData(prevChatData => ({
            ...prevChatData,
            [stepId]: [...(prevChatData[stepId] || []), newChat]
        }));
    };

    // 입력 탭이 변경되면 프롬프트를 서버에 보내고 응답을 받음
    useEffect(() => {
        const visitedSteps = getSessionVisitedSteps();

        if (stepId == null || visitedSteps[stepId]) return;

        const stepIdNumber = parseInt(stepId, 10);
        const fixedPrompt = fixedPrompts[stepIdNumber];

        setChatAndSessionMessages(fixedPrompt);

        const sendFixedPrompt = async () => {
            onLoadingChange(true);
            try {
                const data = await sendImageMessage();
                saveChatData(data);
            } catch (error) {
                setAlertMessage('요청을 처리하는 중에 오류가 발생했습니다.');
                setAlertOpen(true);
            } finally {
                onLoadingChange(false);
            }
        };

        sendFixedPrompt();
        setSessionVisitedSteps(stepId);
    }, [stepId]);

    // 추가 질문 핸들러
    const handleExtraQuestion = async () => {
        let extraQuestion = "";

        switch (stepId) {
            case "2":
                // 사용자가 버튼을 처음 누르면 모달을 띄워서 안내 문구를 보여주고 변수1을 입력받고, 해당 변수를 포함한 질문으로 Api 요청,
                // 두번째 누른 경우 모달을 띄워서 안내 문구를 보여주고 변수2을 입력받고, 해당 변수를 포함한 질문으로 Api 요청,
                if (!firstBuildingDetail) {
                    const input1 = await showDialogAndGetInput();
                    extraQuestion = `사진에서의 ${input1}에 대한 정보가 궁금해. 위 파일을 참고해서 ${input1}의 용도, 바닥면적, 층의 높이 등을 분석해줘.`;
                    setFirstBuildingDetail(input1);
                } else {
                    const input2 = await showDialogAndGetInput();
                    extraQuestion = `${input2} 공간에 대한 정보만 추려줘.`;
                    setSecondBuildingDetail(input2);
                }
                break;
            case "8":
                extraQuestion = "이 7가지 시나리오 중에서 대피 경로 최적화의 시나리오는 몇번 시나리오인지 자세한 이유와 함께 알려줘";
                break;
            case "12":
                extraQuestion = "각 개선안에 대해 비용이 얼마정도 드는지 대략적으로 알려줘.";
                break;
        }

        setChatAndSessionMessages(extraQuestion);

        try {
            onLoadingChange(true);
            const data = await sendImageMessage();
            saveChatData(data);
        } catch (error) {
            setAlertMessage('요청을 처리하는 중에 오류가 발생했습니다.');
            setAlertOpen(true);
        } finally {
            onLoadingChange(false);
        }
    };

    // 채팅 상태 업데이트
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    function saveUserChatData() {
        const imageUrls = getSessionImageUrls();

        if (imageUrls == null) {
            setAlertMessage('먼저 사진을 넣어주세요');
            setAlertOpen(true);
        }

        if (inputValue.trim()) {
            if (stepId == null)
                return;

            // 채팅 데이터 저장
            setChatData(prevChatData => {
                // 사용자가 입력한 채팅 내용 저장
                const newChat: ChatData = {
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: inputValue // 입력 텍스트
                    }]
                };

                setInputValue('');
                setSessionChatMessages(newChat, stepId);

                return {
                    ...prevChatData,
                    [stepId]: [...(prevChatData[stepId] || []), newChat]
                };
            });
        }
    }

    // 서버에 api 요청 후 데이터 받기
    const handleSend = async () => {
        saveUserChatData();

        onLoadingChange(true);

        try {
            let data;
            // 이미지를 포함해 GPT 요청
            data = await sendImageMessage();
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
            if (stepId == null)
                return prevChatData;

            response.forEach(res => {
                // 응답을 GPT API 형식에 맞게 변환한 후 저장
                let resData = {
                    role: 'assistant',
                    content: [{
                        type: "text",
                        text: res.message.content
                    }]
                }

                // 세션스토리지에 새로운 대화내역을 추가하여 저장
                setSessionChatMessages(resData, stepId);
            });

            return {
                ...prevChatData,
                [stepId]: getSessionChatMessagesByStepId(stepId)
            };
        });
    };

    // 알림 창 닫기
    const handleAlertClose = (_event: SyntheticEvent<any, Event> | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') // 알림 창 외부를 클릭하여 알림 창이 닫히지 않도록 함
            return;

        setAlertOpen(false);
    };

    // 채팅을 입력하고 엔터를 눌렀을 때
    const handleTextKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            handleSend();
        }
    };

    // 다이얼로그 열기 및 값 반환
    const showDialogAndGetInput = () => {
        return new Promise<string>((resolve) => {
            setResolveInputPromise(() => resolve);
            setDialogOpen(true);
        });
    };

    // 다이얼로그 제출 핸들러
    const handleDialogSubmit = () => {
        if (resolveInputPromise) {
            resolveInputPromise(dialogInputValue);
            setDialogInputValue('');
        }
        handleDialogClose()
    };

    // 다이얼로그 닫기
    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid size={['2', '8', '12'].includes(stepId || "0") ? 9 : 12}>
                    <TextField
                        placeholder='AI에게 보내기'
                        multiline
                        fullWidth
                        maxRows={5}
                        value={inputValue}
                        onChange={handleChange}
                        onKeyPress={handleTextKeyPress}
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
                                backgroundColor: '#F8F8F8',
                            }
                        }}
                    />
                </Grid>
                {['2', '8', '12'].includes(stepId || "0") && (
                    <Grid size={2} display="flex" alignItems="center" justifyContent="center">
                        <Fab variant="extended" color={"primary"} onClick={handleExtraQuestion}>
                            추가 질문
                        </Fab>
                    </Grid>
                )}
            </Grid>
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
            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>{!firstBuildingDetail ? "정보를 알고싶은 층을 입력해주세요:" : "정보를 알고싶은 공간을 입력해주세요:"}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="상세 정보 입력"
                        fullWidth
                        value={dialogInputValue}
                        onChange={(e) => setDialogInputValue(e.target.value)}
                        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                                event.preventDefault();
                                handleDialogSubmit();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>취소</Button>
                    <Button onClick={handleDialogSubmit}>확인</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
