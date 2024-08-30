import {ChangeEvent, KeyboardEvent, useState} from 'react';
import {IconButton, InputAdornment, TextField} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';

interface InputProps {
    onSend: (message: string) => void;
}

export default function Input({onSend}: InputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSend = () => {
        if (inputValue.trim()) {
            onSend(inputValue);
            setInputValue('');
        }
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <TextField
            placeholder='AI에게 보내기'
            multiline
            fullWidth
            maxRows={5}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            InputProps={{
                startAdornment: (
                    <InputAdornment position='start'>
                        <IconButton>
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
    );
}
