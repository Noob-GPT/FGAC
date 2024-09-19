// 세션 스토리지에서 이전 대화 내용을 가져오는 함수
const getPreviousMessages = () => {
    const data = sessionStorage.getItem('chatMessages');
    return data ? JSON.parse(data) : [];
};

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

// 텍스트만 담아서 API 요청
export const sendTextMessage = async (message: string): Promise<any> => {
    const previousMessages = getPreviousMessages();
    const payload = [
        ...previousMessages,
        {role: 'user', content: message}
    ];

    const response = await fetch('/api/v1/chatGpt/prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Text message send failed');

    return await response.json();
};

// 텍스트와 이미지를 담아서 API 요청
export const sendImageMessage = async (text: string, imgUrl: string): Promise<any> => {
    const previousMessages = getPreviousMessages();
    const payload = [
        ...previousMessages,
        {
            role: 'user',
            content: [
                    {type: 'text', text: text},
        {
            type: 'image_url',
            image_url: {
                url: imgUrl
            }
        }
    ]
}];

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