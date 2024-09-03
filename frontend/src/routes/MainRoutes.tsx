import {MainLayout} from '@layout';
import {MainPage} from '@pages';
import {Navigate} from 'react-router-dom';

const MainRoutes = [
    {
        path: '/',
        element: <MainLayout/>,
        children: [
            {
                path: '',
                element: <Navigate to="/step/1" replace/>
            },
            {
                path: 'step/:stepId',
                element: <MainPage/>
            }
        ]
    },
    {
        path: '*',
        element: <div>Not Found</div>
    }
];

export default MainRoutes;
