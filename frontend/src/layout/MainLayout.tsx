import {Box} from '@mui/material';
import {Outlet} from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
    return (
        <Box display={'flex'} minHeight={'100vh'}>
            <Sidebar/>
            <Outlet/>
        </Box>
    );
}