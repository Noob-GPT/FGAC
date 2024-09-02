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
