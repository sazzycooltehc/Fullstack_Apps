class Config:
    PAGE_TITLE = "Langchain Chatbot"

    OLLAMA_MODELS = ('llama3.2:latest' , 'gemma:2b', 'mistral:latest')

    SYSTEM_PROMPT = f"""You are a helpful chatbot that has access to the following 
                    open-source models {OLLAMA_MODELS}.
                    You can can answer questions for users on any topic."""