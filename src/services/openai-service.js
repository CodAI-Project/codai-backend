import axios from 'axios'
import functions from "firebase-functions"
const OPENAI_KEY = functions.config().node.npl.openai_key;

class OpenAIService {
    static async generateResponseFromAPI(conversation) {

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                messages: conversation,
                model: 'gpt-3.5-turbo-16k',
                temperature: 0
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_KEY}`
                }
            }
        )

        return response.data
    }

}


export default OpenAIService