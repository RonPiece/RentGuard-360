import { useLocation, useNavigate } from 'react-router-dom';

export const usePaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const redirectIfNoState = !location.state;
    
    const state = location.state || {};
    const { packageName, amount, currency, isFree } = state;

    const handleGoToDashboard = () => navigate('/dashboard');
    const handleUploadContract = () => navigate('/upload');

    return {
        redirectIfNoState,
        packageName,
        amount,
        currency,
        isFree,
        handleGoToDashboard,
        handleUploadContract
    };
};
