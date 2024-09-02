import {ChangeEvent, ClipboardEvent, KeyboardEvent, useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CancelIcon from '@mui/icons-material/Cancel';
import {DropEvent, FileRejection, useDropzone} from 'react-dropzone';
import {uploadImage} from '@utils';

interface InputProps {
    onSend: (message: string) => void;
    onImagePaste: (image: File) => void;
}

export default function Input({onSend, onImagePaste}: InputProps) {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const [imageLink, setImageLink] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [hover, setHover] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSend = () => {
        if (inputValue.trim()) {
            onSend(inputValue);
            setInputValue('');
        }
    };

    const handleTextKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    // 이미지 dialog 열기
    const handleOpen = () => {
        setOpen(true);
    };

    // 이미지 dialog 닫기
    const handleClose = () => {
        setOpen(false);
        setImageLink('');
    };

    const handleImageLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
        setImageLink(event.target.value);
    };

    const handleImageLinkUpload = () => {
        onImagePaste(new File([imageLink], "imageLink"));
        setImageUrl(imageLink);
        handleClose();
    };

    const handleImageLinkKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleImageLinkUpload();
        }
    };

    const handleImagePaste = (event: ClipboardEvent) => {
        const text = event.clipboardData.getData('text');

        if (text.startsWith('http')) { // 이미지 링크일 경우
            onImagePaste(new File([text], "imageLink"));
            setImageUrl(text);
        } else { // 링크가 아닌 이미지 파일일 경우
            // ?. 연산자는 clipboardData가 null 또는 undefined일 경우 items에 접근하지 않도록 함
            const items = event.clipboardData?.items;

            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                        const file = items[i].getAsFile();

                        if (file) {
                            handleImageUpload(file);
                            break;
                        }
                    }
                }
            }
        }

        handleClose();
    };

    const {getInputProps} = useDropzone({
        onDrop: (acceptedFiles: File[], fileRejections: FileRejection[], event: DropEvent) => {
            const dragEvent = event as DragEvent;
            const text = dragEvent.dataTransfer?.getData('text');

            if (text && text.startsWith('http')) {
                setImageUrl(text);
            } else {
                const file = acceptedFiles[0];

                if (file && file.type.startsWith('image/'))
                    handleImageUpload(file);
            }
        },
        accept: {'image/*': []}, // 이미지 파일만 허용
        multiple: false, // 한 번에 하나의 파일만 허용
        noDrag: true
    });

    const handleImageUpload = async (file: File) => {
        const imageUrl = await uploadImage(file);

        if (imageUrl) {
            onImagePaste(new File([imageUrl], "imageLink"));
            setImageUrl(imageUrl);
        }
    };

    const handleImageRemove = () => {
        setImageUrl(null);
    };

    return (
        <>
            <Box>
                {imageUrl && (
                    <Box
                        width={'65px'}
                        height={'55px'}
                        p={'0 0 5px 15px'}
                        position='relative'
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                    >
                        <img src={imageUrl} alt='Uploaded' style={{maxWidth: '100%', height: '100%'}} />
                        {hover && (
                            <IconButton
                                size={'small'}
                                onClick={handleImageRemove}
                                style={{
                                    position: 'absolute',
                                    top: '-10px',
                                    right: '-10px',
                                    padding: '0',
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)'
                                }}
                            >
                                <CancelIcon />
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
                                <IconButton onClick={handleOpen}>
                                    <ImageIcon sx={{fontSize: 28}}/>
                                </IconButton>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position='end'>
                                <IconButton onClick={handleSend} disabled={!inputValue}>
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
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>이미지 추가</DialogTitle>
                <DialogContent>
                    <TextField
                        placeholder='이미지를 붙여 넣거나 링크를 입력하세요'
                        fullWidth
                        value={imageLink}
                        onChange={handleImageLinkChange}
                        onKeyDown={handleImageLinkKeyPress}
                        onPaste={handleImagePaste}
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
                    <Button onClick={handleClose} color="primary">
                        취소
                    </Button>
                    <Button onClick={handleImageLinkUpload} color="primary">
                        업로드
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
