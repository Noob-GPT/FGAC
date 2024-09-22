import {SyntheticEvent, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Button} from "@mui/material";

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

    const handleReset = () => {
        sessionStorage.clear();
        setValue(0);
        navigate('/step/1');
    }

    return (
        <Box
            bgcolor={'#F8F8F8'}
            borderRight={1}
            borderColor={'divider'}
            minHeight={'100%'}
            display="flex"
            flexDirection="column"
        >
            <Box>
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
                    <Tab label='캐드 도면 이미지 업로드' {...a11yProps(0)} />
                    <Tab label='건축공간 특성 조사' {...a11yProps(1)} />
                    <Tab label='관련 법규조항 조사' {...a11yProps(2)} />
                    <Tab label='가연물 & 피난자 특성 조사' {...a11yProps(3)} />
                    <Tab label='피난시나리오 작성' {...a11yProps(4)} />
                    <Tab label='피난시간 계산' {...a11yProps(5)} />
                    <Tab label='개선안 도출' {...a11yProps(6)} />
                </Tabs>
            </Box>
            <Box display={'flex'} justifyContent={'center'} alignContent={'center'} p={2} mt="auto">
                <Button variant={'outlined'} onClick={handleReset}>다시 시작하기</Button>
            </Box>
        </Box>
    );
}
