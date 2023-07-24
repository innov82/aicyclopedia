
const {
    EMBEDDING_MODEL
} = require('../config/consts');

const createEmbedding = async(
    input
) => {
    console.log(input);
    const res = await fetch('https://api.openai.com/v1/embeddings', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            method: 'POST',
                body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: input.trim().replaceAll('\n', ' '),
            }),
    }).then((r) => r.json());
    
    return {embedding: res, content: input};
    
}

module.exports = {
    createEmbedding
}