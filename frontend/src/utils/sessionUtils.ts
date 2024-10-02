export const setSessionChatMessages = (message: {}, stepId: string) => {
    const chatMessages = JSON.parse(sessionStorage.getItem('chatMessages') || '[]');
    const stepIdChatMessages = JSON.parse(sessionStorage.getItem(`chatMessages_${stepId}`) || '[]');

    sessionStorage.setItem('chatMessages', JSON.stringify([...chatMessages, message]));
    sessionStorage.setItem(`chatMessages_${stepId}`, JSON.stringify([...stepIdChatMessages, message]));
};

export const getSessionChatMessages = () => {
    return JSON.parse(sessionStorage.getItem('chatMessages') || '[]');
}

export const getSessionChatMessagesByStepId = (stepId: string) => {
    return JSON.parse(sessionStorage.getItem(`chatMessages_${stepId}`) || '[]');
}

export const setSessionImageUrls = (urls: string[]) => {
    sessionStorage.setItem('imageUrls', JSON.stringify(urls));
}

export const getSessionImageUrls = () => {
    return JSON.parse(sessionStorage.getItem('imageUrls') || '[]');
}

export const setSessionVisitedSteps = (step: string) => {
    const visitedSteps = getSessionVisitedSteps();

    visitedSteps[step] = true;

    sessionStorage.setItem('visitedSteps', JSON.stringify(visitedSteps));
}

export const getSessionVisitedSteps = () => {
    return JSON.parse(sessionStorage.getItem('visitedSteps') || '{}');
}