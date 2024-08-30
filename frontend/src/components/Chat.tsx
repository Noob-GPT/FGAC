import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Divider} from '@mui/material';

interface ChatProps {
    data: {
        sender: string;
        content: string;
    };
}

export default function Chat({data}: ChatProps) {
    const {sender, content} = data;

    return (
        <Box py={3}>
            <Typography variant={'h6'} fontWeight={'bold'} gutterBottom>{sender}</Typography>
            <Divider/>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    img: ({node, ...props}) => (
                        <img style={{maxWidth: '50%'}} {...props} />
                    ),
                    table: ({node, ...props}) => (
                        <table style={{width: '100%', borderCollapse: 'collapse'}} {...props} />
                    ),
                    th: ({node, ...props}) => (
                        <th style={{
                            border: '1px solid #ddd',
                            padding: '8px',
                            backgroundColor: '#f2f2f2',
                            textAlign: 'left'
                        }} {...props} />
                    ),
                    td: ({node, ...props}) => (
                        <td style={{border: '1px solid #ddd', padding: '8px'}} {...props} />
                    )
                }}
            >
                {content}
            </ReactMarkdown>
        </Box>
    );
}