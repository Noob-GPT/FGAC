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
import {sendImageMessage, sendTextMessage} from '@utils';
import {useParams} from 'react-router-dom';

interface ChatData {
    sender: string;
    content: string;
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
    const [hover, setHover] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertOpen, setAlertOpen] = useState(false);
    const {stepId} = useParams<{ stepId: string }>();

    // 채팅 상태 업데이트
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    // 서버에 api 요청 후 데이터 받기
    const handleSend = async () => {
        if (inputValue.trim() || uploadedImageUrl) {
            setChatData(prevChatData => {
                const newChatData = [...(prevChatData[stepId || 'step1'] || [])];
                const markdownImage = uploadedImageUrl ? `![image](${uploadedImageUrl})\n\n` : '';

                newChatData.push({
                    sender: 'USER',
                    content: `${markdownImage}${inputValue}`
                });

                setInputValue('');
                setSessionData(newChatData);

                return {
                    ...prevChatData,
                    [stepId || 'step1']: newChatData
                };
            });

            try {
                const imgUrl = uploadedImageUrl;
                let data;

                setUploadedImageUrl(null);

                if (imgUrl) // 이미지와 텍스트를 함께 보내는 경우
                    data = await sendImageMessage(inputValue, imgUrl);
                else // 텍스트만 보내는 경우
                    data = await sendTextMessage(inputValue);

                saveChatData(data);
            } catch (error) {
                setAlertMessage('요청을 처리하는 중에 오류가 발생했습니다.');
                setAlertOpen(true);
            }
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
                newChatData.push({
                    sender: 'FGAC',
                    content: res.message.content
                });
            });

            setSessionData(newChatData);

            return {
                ...prevChatData,
                [stepId || 'step1']: newChatData
            };
        });
    };

    // 세션 스토리지에 채팅 데이터 저장
    const setSessionData = (data: any) => {
        sessionStorage.setItem(stepId || 'step1', JSON.stringify(data));
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
