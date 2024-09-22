import {
    ChangeEvent,
    ClipboardEvent,
    KeyboardEvent,
    MouseEvent,
    SyntheticEvent,
    useEffect,
    useRef,
    useState
} from 'react';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import {FileRejection, useDropzone} from 'react-dropzone';
import {
    Alert,
    Box,
    Button,
    IconButton,
    InputAdornment,
    Snackbar,
    SnackbarCloseReason,
    TextField,
    Typography
} from '@mui/material';
import {uploadImage} from '@utils';
import {useNavigate} from 'react-router-dom';

export default function InputImagePage() {
    const [inputImageUrl, setInputImageUrl] = useState(''); // 이미지 URL 입력 상태
    const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]); // 업로드된 이미지 URL 목록 상태
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // 각 이미지에 대한 마우스 호버 상태
    const [alertMessage, setAlertMessage] = useState(''); // 경고 메시지 상태
    const [alertOpen, setAlertOpen] = useState(false); // 경고 창 열림/닫힘 상태
    const [hasScroll, setHasScroll] = useState(false); // 스크롤 여부 상태
    const scrollBoxRef = useRef<HTMLDivElement | null>(null); // 스크롤이 생기는 박스의 ref
    const navigate = useNavigate();

    // 이미지 URL을 업로드하고 배열에 저장
    const handleImageUrlUpload = (url: string) => {
        if (url.trim()) {
            try {
                new URL(url); // 입력된 URL이 유효한지 확인
                setUploadedImageUrls((prev) => [...prev, url]);
                setInputImageUrl('');
            } catch (error) { // 유효하지 않은 URL인 경우 경고 메시지 표시
                setAlertMessage('유효한 URL이 아닙니다.');
                setAlertOpen(true);
            }
        }
    };

    // 이미지 파일을 업로드하고 배열에 저장
    const handleImageUpload = async (file: File) => {
        const imageUrl = await uploadImage(file);

        if (imageUrl)
            setUploadedImageUrls((prev) => [...prev, imageUrl]);
    };

    // 입력된 이미지 URL 상태 업데이트
    const handleImageUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputImageUrl(event.target.value);
    };

    // 이미지 URL 입력 후 엔터를 눌렀을 때 업로드 처리
    const handleImageUrlKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleImageUrlUpload(inputImageUrl);
        }
    };

    // 이미지 붙여넣기
    const handleImagePaste = async (event: ClipboardEvent) => {
        const text = event.clipboardData.getData('text');
        const items = event.clipboardData?.items;

        event.preventDefault();

        if (text.startsWith('http')) { // 붙여넣은 내용이 URL인 경우
            handleImageUrlUpload(text);
        } else if (items) { // 붙여넣은 내용이 파일인 경우
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();

                    if (file)
                        await handleImageUpload(file);
                }
            }
        }
    };

    // 이미지 삭제
    const handleImageDelete = (index: number) => {
        setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index)); // 해당 인덱스의 이미지를 삭제
    };

    // 드래그 앤 드롭
    const {getRootProps, isDragActive} = useDropzone({
        onDrop: async (acceptedFiles: File[], _: FileRejection[]) => {
            // 모든 파일을 순회하며 업로드 처리
            const uploadPromises = acceptedFiles.map(async (file) => {
                if (file.type.startsWith('image/')) {
                    await handleImageUpload(file);
                }
            });

            // 모든 업로드가 완료될 때까지 기다림
            await Promise.all(uploadPromises);
        },
        accept: {'image/*': []}, // 이미지 파일만 허용
    });

    // 세션 스토리지에 업로드된 이미지 URL 목록 저장
    const setSessionImages = () => {
        sessionStorage.setItem('images', JSON.stringify(uploadedImageUrls));
    }

    // 세션 스토리지에서 업로드된 이미지 URL 목록 가져오기
    const getSessionImages = () => {
        const images = sessionStorage.getItem('images');

        return images ? JSON.parse(images) : [];
    };

    // 세션 스토리지에 저장된 이미지가 있는지 확인
    const isSavedSessionImages = () => {
        return sessionStorage.getItem('images') !== null;
    }

    const handleNextStep = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setSessionImages();
        navigate('/step/2');
    };

    // 알림 창 닫기
    const handleAlertClose = (_event: SyntheticEvent<any, Event> | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') // 알림 창 외부를 클릭하여 알림 창이 닫히지 않도록 함
            return;

        setAlertOpen(false);
    };

    // 세션 스토리지에서 업로드된 이미지 URL 목록 가져와서 상태 업데이트
    useEffect(() => {
        setUploadedImageUrls(getSessionImages());
    }, []);

    // 스크롤 여부 확인
    useEffect(() => {
        const scroll = scrollBoxRef.current;

        if (scroll) {
            setHasScroll(scroll.scrollHeight > scroll.clientHeight);
            scroll.scrollIntoView({behavior: 'smooth'});
        }
    }, [uploadedImageUrls]);

    return (
        <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            width={'100%'}
            height={'100vh'}
        >
            <Box
                ref={scrollBoxRef}
                display={'flex'}
                flexDirection={'column'}
                flexGrow={1}
                width={'100%'}
                overflow={'auto'}
            >
                <Box
                    {...getRootProps()}
                    display={'flex'}
                    flexDirection={'column'}
                    flexGrow={1}
                    justifyContent={'center'}
                    alignItems={'center'}
                    pt={7}
                    pb={2}
                    pl={hasScroll ? '17px' : '0'}
                    sx={{cursor: 'pointer'}}
                >
                    {uploadedImageUrls.length > 0 ? ( // 업로드된 이미지가 있을 경우
                        <>
                            <Box
                                position={'relative'}
                                display={'flex'}
                                flexWrap={'wrap'}
                                gap={3}
                                maxWidth={800}
                            >
                                {uploadedImageUrls.map((url, index) => (
                                    <Box
                                        key={index}
                                        width={250}
                                        height={250}
                                        position={'relative'}
                                        display={'flex'}
                                        justifyContent={'center'}
                                        alignItems={'center'}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        onClick={(event) => event.stopPropagation()} // 클릭 이벤트 전파 차단
                                        sx={{cursor: 'default'}}
                                    >
                                        <Box
                                            component={'img'}
                                            src={url}
                                            alt={`Uploaded ${index}`}
                                            maxWidth={'100%'}
                                            maxHeight={'100%'}
                                        />
                                        {hoveredIndex === index && ( // Hover 상태일 때 삭제 버튼 표시
                                            <IconButton
                                                onClick={() => handleImageDelete(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: '-0px',
                                                    right: '0px',
                                                    padding: '0'
                                                }}
                                            >
                                                <CancelIcon fontSize={'large'}/>
                                            </IconButton>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                            {!isSavedSessionImages() && (
                                <Button
                                    variant={'contained'}
                                    size={'large'}
                                    sx={{position: 'fixed', bottom: '100px'}}
                                    onClick={handleNextStep}
                                >
                                    <Typography variant={'h6'}>업로드</Typography>
                                </Button>
                            )}
                        </>
                    ) : ( // 업로드된 이미지가 없을 경우
                        <>
                            <AddPhotoAlternateOutlinedIcon sx={{fontSize: '100px'}}/>
                            <Typography variant={'h4'} mt={3}>
                                {isDragActive ? '이미지를 여기에 드롭하세요.' : '이미지를 업로드해주세요.'}
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>
            <Box maxWidth={800} width={'100%'} mb={2}>
                <TextField
                    placeholder='이미지를 붙여 넣거나 링크를 입력하세요'
                    fullWidth
                    value={inputImageUrl}
                    onChange={handleImageUrlChange}
                    onKeyDown={handleImageUrlKeyPress}
                    onPaste={(event) => handleImagePaste(event)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position='end'>
                                <IconButton
                                    onClick={() => handleImageUrlUpload(inputImageUrl)}
                                    disabled={!inputImageUrl}
                                >
                                    <FileUploadOutlinedIcon/>
                                </IconButton>
                            </InputAdornment>
                        ),
                        inputProps: {
                            sx: {p: 0}
                        },
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
                autoHideDuration={3000}
                onClose={handleAlertClose}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert onClose={handleAlertClose} severity='error' sx={{width: '100%'}}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
