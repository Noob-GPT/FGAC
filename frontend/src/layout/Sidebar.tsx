import {SyntheticEvent, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const initialStep = parseInt(location.pathname.split('/step/')[1]) - 1;
    const [value, setValue] = useState(!isNaN(initialStep) ? initialStep : 0);

    const handleChange = (event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
        navigate(`/step/${newValue + 1}`);
    };

    return (
        <Box bgcolor={'#F8F8F8'} borderRight={1} borderColor={'divider'} minHeight={'100%'}>
            <Box display={'flex'} justifyContent={'center'} alignContent={'center'} p={2}>
                <Typography variant={'h4'} fontWeight={'bold'} color={'#DC0000'}>FGAC</Typography>
            </Box>
            <Tabs
                orientation='vertical'
                variant='scrollable'
                value={value}
                onChange={handleChange}
                aria-label='Vertical tabs example'
                sx={{width: 260, mt: 2}}
            >
                <Tab label='Step1' {...a11yProps(0)} />
                <Tab label='Step2' {...a11yProps(1)} />
                <Tab label='Step3' {...a11yProps(2)} />
                <Tab label='Step4' {...a11yProps(3)} />
                <Tab label='Step5' {...a11yProps(4)} />
                <Tab label='Step6' {...a11yProps(5)} />
                <Tab label='Step7' {...a11yProps(6)} />
            </Tabs>
        </Box>
    );
}
