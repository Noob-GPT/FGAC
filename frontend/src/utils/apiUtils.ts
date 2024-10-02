import {getSessionChatMessages} from './sessionUtils';

// 이미지 파일 업로드 API를 요청
export const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();

    formData.append('image', file);

    try {
        const response = await fetch('/api/v1/chatGpt/image', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            return await response.text();
        } else {
            console.error('Image upload failed');
            return null;
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

export const sendImageMessage = async () => {
    const payload = getSessionChatMessages();

    const response = await fetch('/api/v1/chatGpt/prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Image message send failed');

    return await response.json();
};