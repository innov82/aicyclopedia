const axios = require('axios');
const cheerio = require('cheerio');
const {
    supabaseAdmin
} = require('../utils/supbase');

const {
    createEmbedding
} = require('../utils/generate-embeddings');

const {
    PROXY_API_KEY, 
    EMBEDDING_TOKEN_COUNT,
    PROMPT_TEMPLATE
} = require('../config/consts');

const schema = {
    "name": "string",
    "company overview": "string",
    "company faq": "url",
    "product_service_offering": ["string"],
    "industry_served": ["string"],
    "most_relevant_links_to_understand_the_company": ["url"],
    "summary_takeaways": ["string"]
};

const removeTags = [
    "style",
    "script",
    "iframe",
    "img",
    "noscript"
]

const fetchPage = async(req, res) => {
    const company_list = await getCompanyList();
    let promise = [];
    for(let k=0 ; k<company_list.length; k++) {
        promise.push(scrapPage(company_list[k].url));        
    }
    const response = await Promise.all(promise);
    return "success";
}

const getCompanyList = async() => {
    const compay_list = await supabaseAdmin.from('company_list')
    .select("*");
    return compay_list.data;
}

const scrapPage = async(url) => {
    
    const params = {
        api_key: process.env.PROXY_API_KEY,
        url: url
    };
    try{
        const fethc_data = await axios.get('https://proxy.scrapeops.io/v1/', {
            params: params
        })
        
        const content = fethc_data.data;
        // console.log(content);
        const text = getTextChild(content);
        const chunks = splitChunk(text);
        const embedded_data = await getEmbeddedData(chunks);
        const res = saveEmbeddingData(url, embedded_data);

    }catch(e){
        console.log(e);
    }
    
    return "success";
}   

const getTextChild = (html) => {
    let text = '';
    const $ = cheerio.load(html);

    removeTags.map((tag) => {
        $("body").find(`${tag}`).remove();
    })

    text = $("body").text();
    const lines = text.split("\n");
    const concatenatedFileText =lines.join(" ").trim().replace(/\s+/g, " ");
    return concatenatedFileText;
}

const splitChunk = (text) => {
    let chunks=[];

    for (let k = 0; k < text.length; k += EMBEDDING_TOKEN_COUNT) {
        chunks.push(text.slice(k, k + EMBEDDING_TOKEN_COUNT));
    }

    return chunks;
}
const getEmbeddedData = async(chunks) => {
    
    let promise=[];
    for(let k = 0; k<chunks.length; k++){
        promise.push(createEmbedding(chunks[k]));
    }
    const response_embedded = await Promise.all(promise);
    const embedded_data = [];
    for(let k = 0; k<response_embedded.length; k++){
        embedded_data.push({
            embedding: response_embedded[k].embedding.data[0].embedding,
            content: response_embedded[k].content,
            tokens: response_embedded[k].embedding.usage.total_tokens ?? 0
        })
    }

    return embedded_data;
}

const saveEmbeddingData = async(url, embeddding_data,) => {
    
    const delete_s = await supabaseAdmin
        .from('page_content')
        .delete()
        .eq('url', url);

    for(let k=0; k<embeddding_data.length; k++){
        const { error } = await supabaseAdmin.from('page_content')
        .insert([
            {
                url: url,
                content: embeddding_data[k].content,
                embedding: embeddding_data[k].embedding
            }
        ]);
    }

    return 'success';
}

const getSummary = async(req, res) => {

    const url = req.query.url;
    const text_input = req.query.input;
    
    const embedded_input = await createEmbedding(text_input);
    const context = await searchVectorInSupabase(embedded_input.embedding.data[0].embedding)
    const prompt = getPrompt(context, text_input);

    console.log(prompt);

    const messages = [];

    messages.push({
        role: 'user',
        content: prompt
    });

    const response = await chatCompletions({
        token: process.env.OPENAI_API_KEY,
        body: {
            model: 'gpt-3.5-turbo',
            messages
        }
    })
    
    
    const data = await response.json();
    let res_text = '';
    if(data.error) {
        res_text = data.error.message;
    } else {
        res_text = data.choices[0].message.content;
    }
    return res_text;
}

const getPrompt = (context, query) => {
    return PROMPT_TEMPLATE.replace('{CONTEXT}', context).replace('{QUERY}', query);
}

const chatCompletions = async({token, body}) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });
    return response;
}

const searchVectorInSupabase = async(embedding) => {
    let matched_data=[];
    try {
        matched_data = await supabaseAdmin.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.76,
            match_count: 5
        })
    } catch(error) {
        console.log(error)
    }
    let context = "";
    for(let k=0; k<matched_data.data.length; k++){
        context += matched_data.data[k].content
    }
    return context;
}

module.exports ={
    fetchPage,
    getSummary,
    getCompanyList
}