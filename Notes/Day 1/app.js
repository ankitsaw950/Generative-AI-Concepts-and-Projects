import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk/index.mjs";

const groq = new Groq({apiKey: process.env.GROG_API_KEY});


async function main(){

const response = await groq.chat.completions.create({
    model:"llama-3.3-70b-versatile",
    messages:[
        {
            role:"user",
            content:"Hello",
        }
    ]
})

console.log(response.choices[0].message.content)


}

main()