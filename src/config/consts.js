
const EMBEDDING_MODEL='text-embedding-ada-002';
const SUPABASE_PUBLIC_URL=process.env.SUPABASE_PUBLIC_URL??'';
const SUPABASE_ROLE_KEY=process.env.SUPABASE_ROLE_KEY??'';
const SUPABASE_ANON_KEY=process.env.SUPABASE_ANON_KEY??'';
const PROXY_API_KEY=process.env.PROXY_API_KEY??'';
const EMBEDDING_TOKEN_COUNT=500;
const PROMPT_TEMPLATE=`
You are an expert analyst. You are working with a venture capital firm in evaluating, doing due diligence on potential investments and get all information with real-time. Answer concisely only in bullet points. Do not mention who you are. Respond only with bullets with no pre-amble.
Context: {CONTEXT}
Question: {QUERY}
Answer: `;

module.exports = {
    EMBEDDING_MODEL,
    SUPABASE_PUBLIC_URL,
    SUPABASE_ROLE_KEY,
    SUPABASE_ANON_KEY,
    PROXY_API_KEY,
    EMBEDDING_TOKEN_COUNT,
    PROMPT_TEMPLATE
}