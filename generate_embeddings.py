import json
import numpy as np
from openai import OpenAI

# 设置API Key
client = OpenAI(api_key="OPENAI_API_KEY")

# 读取JSON
with open('books.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def get_embedding(text):
    """获取单个文本的embedding向量"""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text.strip()
    )
    return np.array(response.data[0].embedding)

# 为每本书生成embedding
for book in data['books']:
    print(f"Processing {book['title']} ...")
    
    # 分别embedding各个字段
    title_vec = get_embedding(book['title'])
    theme_vec = get_embedding(book['theme'])
    summary_vec = get_embedding(book['summary'])
    category_vec = get_embedding(book['category'])
    style_vec = get_embedding(book['style'])
    
    # 加权合并
    book_vector = (
        0.10 * title_vec +
        0.35 * theme_vec +
        0.20 * summary_vec +
        0.15 * category_vec +
        0.20 * style_vec
    )
    
    # 转换回列表格式存储
    book['embedding_vector'] = book_vector.tolist()
    print(f"Done: {book['title']}")

# 保存回JSON
with open('books_with_embeddings.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("All embeddings generated")