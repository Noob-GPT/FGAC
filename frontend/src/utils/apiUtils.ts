import {getSessionChatMessages, getSessionImageUrls} from './sessionUtils';

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

const modifyPayloadWithImageUrls = () => {
    let payload = getSessionChatMessages();

    // 인덱스를 이용해 실제 위치를 찾기
    const lastUserMessage = payload[payload.length - 1];

    if (lastUserMessage && lastUserMessage.content) {
        const imageUrls = getSessionImageUrls();

        // 새로운 이미지 URL을 content에 추가
        const newImageContents = imageUrls.map((url: any) => ({
            type: "image_url",
            image_url: {url}
        }));

        // 기존 content와 새로운 이미지 URL 결합
        lastUserMessage.content = [...lastUserMessage.content, ...newImageContents];

        // 변경된 lastUserMessage는 payload[actualIndex]에 이미 반영됨
    }

    return payload;
}

export const sendImageMessage = async () => {
    // const payload = getSessionChatMessages();
    const payload = modifyPayloadWithImageUrls();

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