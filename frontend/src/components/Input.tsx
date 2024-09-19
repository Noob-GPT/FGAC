import {ChangeEvent, ClipboardEvent, Dispatch, KeyboardEvent, SetStateAction, SyntheticEvent, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Snackbar,
    SnackbarCloseReason,
    TextField,
    Typography
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {DropEvent, FileRejection, useDropzone} from 'react-dropzone';
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
    uploadedImageUrl: string | null;
    setUploadedImageUrl: Dispatch<SetStateAction<string | null>>;
    onImageUpload: (file: File) => void;
}

export default function Input({
                                  setChatData,
                                  uploadedImageUrl,
                                  setUploadedImageUrl,
                                  onImageUpload
                              }: InputProps) {
    const [inputValue, setInputValue] = useState('');
    const [DialogOpen, setDialogOpen] = useState(false);
    const [inputImageUrl, setInputImageUrl] = useState('');
    const [recentImageUrl, setRecentImageUrl] = useState(uploadedImageUrl);
    const [hover, setHover] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const {stepId} = useParams<{ stepId: string }>();

// 입력 탭이 변경되면 프롬프트를 서버에 보내고 응답을 받음
//     useEffect(() => {
//         if (!stepId)
//             return;
//
//         let fixedPrompt = "";
//         switch (stepId) {
//             case '1': // 캐드 도면 이미지 삽입
//                 fixedPrompt = "CAD 도면 이미지를 업로드 할거야 한국어로 알려줘"; // 이 응답을 다음 요청 배열에 assistant 역할로 append 해야함
//                 break;
//             case '2': // 건축공간 특성 조사
//                 if (sessionStorage.getItem('1') != null)
//                     fixedPrompt = sessionStorage.getItem('1') + "사진을 보고 건물의 용도, 규모, 건축면적, 연면적(지하층, 지상층)을 찾아줘. 문 개수와 크기도 알려줘. 그리고 사진에서 찾은 용도를 기반으로 대표적인 가연물 3가지를 찾아줘";
//                 break;
//             case '3': // 관련 법규조항 조사
//                 if (!sessionStorage.getItem('2'))
//                     // @ts-ignore
//                     fixedPrompt = sessionStorage.getItem('1') + sessionStorage.getItem('2') + "건물의 용도, 규모, 건축면적, 연면적을 기반으로 관련된 대한민국 건축법과 소방법에 해당하는 조항을 찾아줘";
//                 break;
//             case '4': // 가연물 피난자 특성
//                 if (!sessionStorage.getItem('3'))
//                 // @ts-ignore
//                     fixedPrompt = sessionStorage.getItem('1') + sessionStorage.getItem('2') + sessionStorage.getItem('3') + "사진에서 찾은 용도의 수용인원 산정 기준(제곱미터/인원)과 바단 번적 곱한 값을 알려줘. 그리고 사진에서의 용도, 규모, 건축면적, 연면적에서 화재가 일어났을 경우 피난하는 사람들의 특성을 논문이나 기사에서 5가지만 찾아서 설명해줘";
//                 break;
//             case '5': // 피난 시나리오 작성
//                 if (!sessionStorage.getItem('4'))
//                 // @ts-ignore
//                     fixedPrompt = sessionStorage.getItem('1') + sessionStorage.getItem('2') + sessionStorage.getItem('3') + sessionStorage.getItem('4') + "전에 대화했던 내용과 사진을 기반으로, 피난 시나리오 7가지를 작성해줘";
//                 break;
//             case '6': // 피난 시간 계산
//                 if (!sessionStorage.getItem('5'))
//                 // @ts-ignore
//                     fixedPrompt = sessionStorage.getItem('1') + sessionStorage.getItem('2') + sessionStorage.getItem('3') + sessionStorage.getItem('4') + sessionStorage.getItem('5') + "전에 대화했던 내용과 사진을 기반으로, 각 시나리오에 대한 피난 시간을 계산해줘";
//                 break;
//             case '7': // 개선안 도출
//                 if (!sessionStorage.getItem('6'))
//                 // @ts-ignore
//                     fixedPrompt = sessionStorage.getItem('1') + sessionStorage.getItem('2') + sessionStorage.getItem('3') + sessionStorage.getItem('4') + sessionStorage.getItem('5') + sessionStorage.getItem('6') + "전에 대화했던 내용과 사진을 기반으로, 개선안을 도출해줘";
//         }
//
//         if (recentImageUrl) {
//             sendImageAssistantMessage(fixedPrompt, recentImageUrl, stepId.toString())
//                 .then(response => {
//                     saveChatData(response);
//                 })
//                 .catch(error => {
//                     console.error('프롬프트 전송 오류:', error);
//                 });
//         }
//     }, [stepId]);

    // 채팅 상태 업데이트
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    // 서버에 api 요청 후 데이터 받기
    const handleSend = async () => {
            const imageUrls = JSON.parse(sessionStorage.getItem("imageUrls") || '[]');

            if (imageUrls == null) {
                setAlertMessage('먼저 사진을 넣어주세요');
                setAlertOpen(true);
            }

            if (inputValue.trim()) {
                // const imgUrl = uploadedImageUrl;
                let data;

                // 채팅 데이터 저장
                setChatData(prevChatData => {
                    const newChatData = [...(prevChatData[stepId || 'step1'] || [])];
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
                    setSessionData(newChatData);

                    return {
                        ...prevChatData,
                        [stepId || 'step1']: newChatData
                    };
                });

                try {
                    // setRecentImageUrl(uploadedImageUrl);
                    // setUploadedImageUrl(null)

                    // 이미지를 포함해 GPT 요청
                    data = await sendImageMessageAuto(inputValue);
                    // 응답 데이터 저장
                    saveChatData(data);
                } catch (error) {
                    setAlertMessage('요청을 처리하는 중에 오류가 발생했습니다.');
                    setAlertOpen(true);
                }
            }
        }
    ;

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
            setSessionData(newChatData);

            return {
                ...prevChatData,
                [stepId || 'step1']: newChatData
            };
        });
    };

    // 세션 스토리지에 채팅 데이터 저장
    const setSessionData = (data: any) => {
        sessionStorage.setItem('chatMessages', JSON.stringify(data));
    };

    // 알림 창 닫기
    const handleAlertClose = (event: SyntheticEvent<any, Event> | Event, reason?: SnackbarCloseReason) => {
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

    // 이미지 dialog 열기
    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    // 이미지 dialog 닫기
    const handleDialogClose = () => {
        setDialogOpen(false);
        setInputImageUrl('');
    };

    // 이미지 링크 상태 업데이트
    const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputImageUrl(event.target.value);
    };

    // 이미지 링크를 입력해서 업로드
    const handleImageUrlUpload = () => {
        if (inputImageUrl.trim()) {
            try {
                new URL(inputImageUrl); // 입력된 URL이 유효한 URL인지 확인
                // 유효한 URL인 경우 이미지 업로드 처리
                setUploadedImageUrl(inputImageUrl);
                handleDialogClose();
            } catch (error) { // 유효하지 않은 URL인 경우 경고 메시지 표시
                setAlertMessage('유효한 URL을 입력하세요.')
                setAlertOpen(true);
            }
        }
    };

    // 이미지 링크를 입력하고 엔터를 눌렀을 때
    const handleImageUrlKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleImageUrlUpload();
        }
    };

    // 이미지 링크로 붙여넣기
    const handleImageUrlPaste = (event: ClipboardEvent) => {
        const text = event.clipboardData.getData('text');

        if (text.startsWith('http'))
            setUploadedImageUrl(text);
    }

    // 이미지 파일로 붙여넣기
    const handleImagePaste = (event: ClipboardEvent) => {
        const items = event.clipboardData?.items;

        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();

                    if (file) {
                        onImageUpload(file);
                        return;
                    }
                }
            }
        }
    };

    // 드래그 앤 드롭
    const {getInputProps} = useDropzone({
        onDrop: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
            const dragEvent = event as DragEvent;
            const text = dragEvent.dataTransfer?.getData('text');

            if (text && text.startsWith('http')) {
                setUploadedImageUrl(text);
            } else {
                const file = acceptedFiles[0];

                if (file && file.type.startsWith('image/')) {
                    onImageUpload(file);
                    handleDialogClose();
                }
            }
        },
        accept: {'image/*': []},
        multiple: false,
        noDrag: true
    });

    return (
        <>
            <Box>
                {uploadedImageUrl && (
                    <Box
                        width={'65px'}
                        height={'55px'}
                        p={'0 0 5px 15px'}
                        position={'relative'}
                        display={'flex'}
                        alignItems={'center'}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <img src={uploadedImageUrl} alt='Uploaded' style={{maxWidth: '100%', maxHeight: '100%'}}/>
                        {hover && (
                            <IconButton
                                size={'small'}
                                onClick={() => setUploadedImageUrl(null)}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    padding: '0',
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)'
                                }}
                            >
                                <CancelIcon/>
                            </IconButton>
                        )}
                    </Box>
                )}
                <TextField
                    placeholder='AI에게 보내기'
                    multiline
                    fullWidth
                    maxRows={5}
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleTextKeyPress}
                    onPaste={handleImagePaste}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                                <IconButton onClick={handleDialogOpen}>
                                    <ImageIcon sx={{fontSize: 28}}/>
                                </IconButton>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position='end'>
                                <IconButton onClick={handleSend} disabled={!inputValue && !uploadedImageUrl}>
                                    <SendIcon/>
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: {
                            p: '14px 6px',
                            borderRadius: '24px',
                            backgroundColor: '#F8F8F8'
                        }
                    }}
                />
            </Box>
            <Dialog open={DialogOpen} onClose={handleDialogClose}>
                <DialogTitle>이미지 추가</DialogTitle>
                <DialogContent>
                    <TextField
                        placeholder='이미지를 붙여 넣거나 링크를 입력하세요'
                        fullWidth
                        value={inputImageUrl}
                        onChange={handleImageUrlChange}
                        onKeyDown={handleImageUrlKeyPress}
                        onPaste={(event) => {
                            handleImageUrlPaste(event);
                            handleImagePaste(event);
                            handleDialogClose();
                        }}
                    />
                    <Button
                        component='label'
                        variant='text'
                        fullWidth
                        color={'inherit'}
                        tabIndex={-1}
                        startIcon={<UploadFileIcon/>}
                        sx={{justifyContent: 'flex-start', mt: 2}}
                    >
                        <Typography variant={'body1'}>컴퓨터에서 업로드</Typography>
                        <input {...getInputProps()}/>
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color='primary'>
                        취소
                    </Button>
                    <Button onClick={handleImageUrlUpload} color='primary' disabled={!inputImageUrl}>
                        업로드
                    </Button>
                </DialogActions>
            </Dialog>
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
