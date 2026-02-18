from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # 允许前端跨域访问

# 初始化OpenAI
client = OpenAI(api_key="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")

# 加载书籍数据
with open('books_with_embeddings.json', 'r', encoding='utf-8') as f:
    books_data = json.load(f)['books']

def cosine_similarity(vec1, vec2):
    """计算余弦相似度"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        user_prompt = request.json['query']
        print(f"收到用户请求：{user_prompt}")  # 调试信息
        
        # 1. 生成用户prompt的embedding
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=user_prompt
        )
        user_vector = response.data[0].embedding
        
        # 2. 计算与所有书的相似度
        similarities = []
        for book in books_data:
            similarity = cosine_similarity(user_vector, book['embedding_vector'])
            similarities.append((book, similarity))
        
        # 3. 排序，取top 6
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_6 = similarities[:6]
        
        print(f"Top 6 候选书籍：{[book['title'] for book, _ in top_6]}")  # 调试信息
        
        # 4. 把top 6给LLM，让它选3本并生成推荐理由
        candidates_text = "\n\n".join([
            f"书名：{book['title']}\n作者：{book['author']}\n简介：{book['summary']}\n核心主题：{book['theme']}\nbook_id: {book['id']}"
            for book, _ in top_6
        ])
        
        llm_prompt = f"""
            ## 角色
            你是一位专业的书籍推荐顾问，擅长根据用户需求精准匹配书籍。
            
            ## 任务
            从6本候选书籍中，选择3本最符合用户需求的书进行推荐。

            ## 要求
            1. 深入理解用户需求的核心诉求（情感需求、阅读目的、知识获取方向等）；
            2. 从候选书籍中选择3本最匹配的书；
            3. 为每本书生成个性化推荐理由（80-120字）；
            4. 推荐理由需结合用户需求，说明为什么这本书适合用户；
            5. 必须使用候选书籍中提供的真实book_id，不要编造。

            ## 输出格式
            纯JSON，不要markdown代码块）：
            {{
            "books": [
                {{
                "title": "书名",
                "author": "作者",
                "reason": "推荐理由",
                "book_id": 对应的book_id数字
                }}
            ]
            }}
            只输出JSON，不要其他内容。

            ## 用户需求
            {user_prompt}

            ## 候选书籍
            {candidates_text}
            """
            
        llm_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": llm_prompt}],
            temperature=0.7
        )
        
        llm_content = (llm_response.choices[0].message.content or "").strip()
        print(f"LLM原始返回：{llm_content}")  # 调试信息
        
        # 去除可能的markdown代码块标记
        if llm_content.startswith("```json"):
            llm_content = llm_content[7:]  # 去掉 ```json
        if llm_content.startswith("```"):
            llm_content = llm_content[3:]  # 去掉 ```
        if llm_content.endswith("```"):
            llm_content = llm_content[:-3]  # 去掉结尾的 ```
        llm_content = llm_content.strip()
        
        # 解析JSON
        recommendations = json.loads(llm_content)
        print(f"解析后的推荐：{recommendations}")  # 调试信息
        
        # 返回符合前端期待的格式
        return jsonify({
            "books": recommendations.get("books", [])
        })
        
    except json.JSONDecodeError as e:
        print(f"JSON解析错误：{e}")
        print(f"LLM返回内容：{llm_content}")
        return jsonify({
            "explanation": "推荐结果解析失败",
            "books": []
        }), 500
        
    except Exception as e:
        print(f"服务器错误：{e}")
        return jsonify({
            "explanation": f"服务器错误：{str(e)}",
            "books": []
        }), 500

@app.route('/book/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """获取单本书的详情"""
    book = next((b for b in books_data if b['id'] == book_id), None)
    if book:
        return jsonify(book)
    return jsonify({"error": "Book not found"}), 404

if __name__ == '__main__':
    import os 
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
