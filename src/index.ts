import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain, loadQAChain } from "langchain/chains";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PromptTemplate } from "langchain";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import * as dotenv from "dotenv";

import express, { Request, Response } from "express";
import cors from "cors";

dotenv.config();

(async () => {

    console.log('Knowledge Base Starting...');

    // express server initialization
    const app = express();
    const port = 5041;
    // qa prompt 
    const QA_PROMPT = PromptTemplate.fromTemplate(`
        You are Alice a Bible Scholar AI Assistant. 
        You are given the following extracted parts of a long document and a question. Provide a conversational answer.
        If you don't know the answer, just say "Hmm, I'm not sure." Don't try to make up an answer.
        If the question is not about the Bible, politely inform them that you are tuned to only answer questions about the Holy Bible.
        Question: {question}
        =========
        {context}
        =========
        Answer in Markdown:
    `);

    const model = new OpenAI({
        modelName: "gpt-3.5-turbo",
        openAIApiKey: process.env.OPENAI_API_KEY,
        streaming: true,
    });

    // document path add optional choice to select or create a directory.
    const docPath = "./docs/bibledocs";

    // documents loader
    const loader = new DirectoryLoader(
        docPath,
        {
          ".txt": (path) => new TextLoader(path),
          ".pdf": (path) => new PDFLoader(path),
        }
    );

    // text splitter 
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkOverlap: 200,
        chunkSize: 1000
    });
    
    // load and split
    const docs = await loader.loadAndSplit(textSplitter);

    // in-memory vector store
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());

    // qa chain
    const chain = ConversationalRetrievalQAChain.fromLLM(
        model, 
        vectorStore.asRetriever(),
        {
            qaTemplate:QA_PROMPT.template
        }
    );
    
    // application middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.get(
        "/",
        async (_: Request, res: Response): Promise<Response> => {
            const content = "Knowledge Base v1.0.0";
            return res.status(200).send({
                message: `${content}`.concat(),
            });
        }
    );

    app.post(
        "/api/qa",
        async (req: Request, res: Response): Promise<Response> => {
            // TODO Access Key Validation
            console.log(`Q:${req.body.question}`);
            let question = req.body.question;
            // TODO Include Chat History
            // let chatHistory = req.body.history || [];
            // respond with qa
            const chainRes = await chain.call({question, chat_history: []});
            console.log(`A":${chainRes.text}`);
            const sanitizedContent = chainRes.text;
            return res.status(200).json({
                data: sanitizedContent,
                // history: chatHistory
            });
        }
    );

    try {
        app.listen(port, ():void => {
            console.log(`Knowledge Base listening on port ${port}`);
        });
    } catch (error:any) {
        console.error(`Knowledge Base error ${error.message}`);
    }

})();
