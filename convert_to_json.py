import pandas as pd
import json

print("开始运行...")

try:
    # 读取Excel
    df = pd.read_excel('Book_Library.xlsx')
    print(f"成功读取Excel，共 {len(df)} 行")
    
    # 转换成JSON格式
    books = []
    for _, row in df.iterrows():
        book = {
            "id": row['book_id'],
            "title": row['title'],
            "author": row['author'],
            "category": row['category'],
            "theme": row['theme'],
            "summary": row['summary'],
            "style": row['style'],
            "embedding_vector": None,
            "book_details": f"book_details/{row['book_id']}.png"
        }
        books.append(book)
    
    # 保存为JSON
    output = {"books": books}
    with open('books.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 成功转换 {len(books)} 本书")

except Exception as e:
    print(f"❌ 错误: {e}")